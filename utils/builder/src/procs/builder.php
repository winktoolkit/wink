<?php

// Load required files
require_once dirname(__FILE__).'/../inc/config.php';
require_once dirname(__FILE__).'/../inc/functions.inc.php';

try
{
    // -----------------------------------
    // Get params choosed and send by the user
    // -----------------------------------

    // Get all modules send
    $modules = param('modules');
    if($modules === FALSE)
        throw new Exception('There is no modules defined');

    // Get other params
    $css_theme = param('css_theme');
    $languages = param('languages');
    
    if($css_theme == FALSE || $css_theme == '')
        $css_theme = 'default';
    
    if($languages == FALSE 
    || is_array($languages) == FALSE
    || count($languages) == 0)
        throw new Exception('A language must to be defined');

    // Get existing list module for references
    $list_modules = parseJsonFile(WINK_PATH_JSON_MODULES);

    // Foreach modules, check if a group or simple class to build
    $list_keys = array();
    $list_keys[] = $css_theme;
    $list_keys[] = implode('', $languages);

    $modules_used = array();
    foreach ($modules as $moduleName) {   
        $details = getModuleDetailsFromName($moduleName, $list_modules->modules);
        if(!isset($details->defaultImpl))
            continue;

        $list_keys[] = getModuleKey($moduleName, $list_modules->modules);
        $modules_used[] = $details->name;
    }

    $guid = md5(implode('-', $list_keys));
    $build_directory = PROJECT_BUILD_DIR.'/'.$guid;

    // Check if a build exists
    if(is_dir($build_directory) === FALSE
    || param('rebuild') === '1')
    {
        // -----------------------------------------
        // Create tmp directory and get conf files
        // -----------------------------------------
        $tmp_directory   = PROJECT_TMP_DIR.'/'.uniqid(time());
        if(!is_dir($tmp_directory) && !mkdir($tmp_directory, 0777))
             throw new Exception('Echec : Can\'t create the folder '.$tmp_directory);

        if(!is_dir($build_directory) && !mkdir($build_directory, 0777))
             throw new Exception('Echec : Can\'t create the folder '.$tmp_directory);

        // Move build files in the new directory
        $list_copies = array(
            WINK_PATH_JSON_MODULES       => $tmp_directory.'/'.basename(WINK_PATH_JSON_MODULES),
            WINK_PATH_JSON_PROFILES      => $tmp_directory.'/'.basename(WINK_PATH_JSON_PROFILES),
            WINK_PATH_XML_BUILD          => $tmp_directory.'/'.basename(WINK_PATH_XML_BUILD),
            WINK_PATH_PROPERTIES_BUILD   => $tmp_directory.'/'.basename(WINK_PATH_PROPERTIES_BUILD)
        );

        foreach ($list_copies as $source => $dest) {
            if(copy($source, $dest) === FALSE)
                throw new Exception('Echec : the copy failed for '.basename($source));
        }

        // -------------------------------
        // Update properties file
        // -------------------------------
        // Open and read properties file
        $properties = array();
        $handle_r = fopen($list_copies[WINK_PATH_PROPERTIES_BUILD], 'r');
        while(FALSE !== ($line = fgets($handle_r))) 
        {
            if(!preg_match('/^[a-z0-9\._\-]+(:|=){1}(( )*[a-z0-9\/\{\}\.\$]+)?/i', $line))
                continue;

            $tmp = preg_split('/(:|=)/', $line);
            $properties[trim($tmp[0])] = isset($tmp[1]) ? trim($tmp[1]) : '';
        }
        fclose($handle_r);

        // Update values
        $properties['project.path'] = getRelativePath($tmp_directory, WINK_DIRECTORY);
        $properties['wink.build.destdir'] = getRelativePath($tmp_directory, $build_directory);
        $properties['build.conf.dir'] = getRelativePath($tmp_directory, $tmp_directory);

        // Rewrite the properties file
        $handle_w = fopen($list_copies[WINK_PATH_PROPERTIES_BUILD], 'w+');
        foreach ($properties as $key => $value)
            fwrite($handle_w, $key.': '.$value."\r\n");
        fclose($handle_w);


        // --------------------------------------------------
        // Update json profile file with the modules choosed
        // --------------------------------------------------
        // Parse Json
        $profile_data = parseJsonFile($list_copies[WINK_PATH_JSON_PROFILES], TRUE);

        // define language choosed
        if(count($languages) == 0)
            $languages = array('en_EN');

        $profile_data['defaultLocaleList'] = $languages;

        // Get CSS files from theme choosed
        $theme_choosed = param('css_theme');
        $defaults_css = searchInDir(array('\.css$'), WINK_DIR_THEMES, FALSE);
        $list_css = array_merge($defaults_css, searchInDir(array('\.css$'), WINK_DIR_THEMES.'/'.$theme_choosed, TRUE));

        // Update css path to relative path
        foreach ($list_css as $k => $path)
            $list_css[$k] = getRelativePath(WINK_DIRECTORY, $path);

        // Reset profils
        $profile_data['profiles'] = array();

        // Rebuild the profil data from modules choosed
        $profile_data['profiles'][0] = array(
            'name' => 'custom',
            'modules' => $modules_used,
            'css' => $list_css
        );

        $res = writeJsonFile($list_copies[WINK_PATH_JSON_PROFILES], $profile_data);
        if($res === FALSE)
            throw new Exception('The write json file has failed');

        // Run the ant build
        exec('ant -buildfile "'.$list_copies[WINK_PATH_XML_BUILD].'"');

        // Remove the temp directory
        rrmdir($tmp_directory);
    }
    
    
    
    // -------------------------------------------------
    // Return the result according to the output format
    // -------------------------------------------------
    $format = param('format');
    if($format == 'zip') 
    {
        $pathZipFile = PROJECT_TMP_DIR.'/'.uniqid(time()).'.zip';

        $zip = new ZipArchive();
        if($zip->open($pathZipFile, ZipArchive::CREATE) !== TRUE)
            throw new Exception('Zip file creation failed');

        $zip = zip_directory($build_directory, $zip);
        $zip->close();

        $res = searchInDir(array('\.(js)$'), $build_directory, TRUE);
        $zipFilename = str_replace('.min.js', '.zip', basename($res[0]));
        
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="'.$zipFilename.'"');
        header('Content-Length: '.filesize($pathZipFile));
        readfile($pathZipFile);
        unlink($pathZipFile);
        exit();
    } 
    else if($format == 'code') 
    {
        $typeFile = 'js';
        if(strtolower(param('file')) == 'css')
            $typeFile = 'css';

        $files = searchInDir(array('\.'.$typeFile.'$'), $build_directory, TRUE);
        echo file_get_contents($files[0]);
    } 
    else if($format == 'json') 
    {
        // Return Json object
        echo json_encode(array(
            'status' => 'success',
            'result' => array(
                'guid' => $guid,
                'filenames' => array_map(function($path) {
                    $relativePath = getRelativePath(WINK_DIRECTORY, $path);
                    $baseURL = 'http://'.$_SERVER['SERVER_NAME'].'/'.basename(realpath(WINK_DIRECTORY)).'/';
                    return rel2abs($relativePath, $baseURL);
                }, searchInDir(array('\.(css|js)$'), $build_directory, TRUE))
            )
        ));
    }
}
catch (Exception $e) 
{
    echo json_encode(array(
        'status' => 'fail',
        'result' => array(
            'code' => $e->getCode(),
            'message' => $e->getMessage()
        )
    ));
}
