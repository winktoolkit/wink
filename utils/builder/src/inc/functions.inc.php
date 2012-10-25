<?php

// ---------------------------------------------------------
// Generic functions
// ---------------------------------------------------------

/**
 * Get parameter from POST query
 * @param string $var
 * @return mixed (or FALSE is not exists)
 */
function post($var)
{
    if(isset($_POST[$var]))
        return $_POST[$var];
    return FALSE;
}

/**
 * Get parameter from GET query
 * @param string $var
 * @return mixed (or FALSE is not exists)
 */
function get($var)
{
    if(isset($_GET[$var]))
        return $_GET[$var];
    return FALSE;
}

/**
 * Get parameter from GET or POST query
 * 
 * @param string $var
 * @return mixed (or FALSE is not exists)
 */
function param($var)
{
    if(post($var) !== FALSE)
        return post($var);
    if(get($var) !== FALSE)
        return get($var);
    return FALSE;
}

/**
 * print_r structured
 * 
 * @param mixed $datas
 */
function myPrint_r($datas) {
    echo '<pre>';
    print_r($datas);
    echo '</pre>';
}

/**
 * Search file(s) in directory
 * 
 * @param array $patterns
 * @param string $directory
 * @param boolean $recurse
 * @return array
 * @throws Exception
 */
function searchInDir(array $patterns, $directory, $recurse = FALSE)
{
    $css_list = array();
    
    if(is_dir($directory) === FALSE)
        throw new Exception('The directory "'.$directory.'" doesn\'t exist');
    
    $dir_handle = opendir($directory);
    while(FALSE !== ($filename = readdir($dir_handle))) 
    {
        if('.' == $filename || '..' == $filename)
            continue;
        
        $path = $directory.'/'.$filename;
        if(is_dir($path) && $recurse) {
            $css_list = array_merge ($css_list, searchInDir ($patterns, $path, $recurse));
            continue;
        }
        
        foreach ($patterns as $p)
            if(preg_match('/'.$p.'/i', $filename))
                $css_list[] = $path;
    }
    
    closedir($dir_handle);
    
    return $css_list;
}

/**
 * Remove a directory recursively
 * 
 * @param string $dir
 */
function rrmdir($dir) {
    foreach(glob($dir . '/*') as $file) {
        if(is_dir($file))
            rrmdir($file);
        else
            unlink($file);
    } rmdir($dir);
}

/**
 * Sort an array according to a template
 * 
 * @example
 *  $toSort     = array('toto', 'tutu', 'tata')
 *  $template   = array('tata', 'titi', 'toto', 'tutu')
 *  $result     = array('tata', 'toto', 'tutu')
 * 
 * @param array $toSort
 * @param array $template
 * @return array
 */
function sortByTemplate(array $toSort, array $template) {
    $arrSorted = array();
    
    do {
        foreach ($template as $k => $value1) {
            foreach ($toSort as $value2)
                if($value1 == $value2)
                    $arrSorted[] = $value2;
            unset($template[$k]);
        }
    } while(count($template) > 0);
    
    return $arrSorted;
}

/**
 * Zip a directory recursively
 * 
 * @param string $directory
 * @param ZipArchive $zip
 * @param string $parent
 * @return \ZipArchive
 * @throws Exception
 */
function zip_directory($directory, ZipArchive $zip, $parent = '')
{
    if(!is_dir($directory))
        throw new Exception('Is not a directory "'.$directory.'"');
    
    $dir_handle = opendir($directory);
    if($dir_handle === FALSE)
        throw new Exception('Open directory has failed');
    
    while(FALSE !== ($f = readdir($dir_handle))) 
    {
        if($f == '.' || $f == '..')
            continue;
        
        $path = $directory.'/'.basename($f);
        if(is_dir($path)) {
            $zip->addEmptyDir($parent.$f);
            $zip = zip_directory ($path, $zip, $parent.$f.'/');
            continue;
        }
        
        $zip->addFile($path, $parent.$f);
    }
    
    closedir($dir_handle);
    
    return $zip;
}

/**
 * Found on http://bsd-noobz.com/blog/php-script-for-converting-relative-to-absolute-url
 * 
 * @param string $rel
 * @param string $base
 * @return string
 */
function rel2abs($rel, $base) 
{
    if (parse_url($rel, PHP_URL_SCHEME) != '')
        return $rel;
    else if ($rel[0] == '#' || $rel[0] == '?')
        return $base . $rel;

    extract(parse_url($base));

    $abs = ($rel[0] == '/' ? '' : preg_replace('#/[^/]*$#', '', $path)) . "/$rel";
    $re = array('#(/\.?/)#', '#/(?!\.\.)[^/]+/\.\./#');

    for ($n = 1; $n > 0; $abs = preg_replace($re, '/', $abs, -1, $n))
        ;
    return $scheme . '://' . $host . str_replace('../', '', $abs);
}

/**
 * JSON.minify()
 * v0.1 (c) Kyle Simpson
 * MIT License
 * 
 * @param string $json
 * @return string
 */
function json_minify($json) {
	$tokenizer = "/\"|(\/\*)|(\*\/)|(\/\/)|\n|\r/";
	$in_string = false;
	$in_multiline_comment = false;
	$in_singleline_comment = false;
	$tmp; $tmp2; $new_str = array(); $ns = 0; $from = 0; $lc; $rc; $lastIndex = 0;

	while (preg_match($tokenizer,$json,$tmp,PREG_OFFSET_CAPTURE,$lastIndex)) {
		$tmp = $tmp[0];
		$lastIndex = $tmp[1] + strlen($tmp[0]);
		$lc = substr($json,0,$lastIndex - strlen($tmp[0]));
		$rc = substr($json,$lastIndex);
		if (!$in_multiline_comment && !$in_singleline_comment) {
			$tmp2 = substr($lc,$from);
			if (!$in_string) {
				$tmp2 = preg_replace("/(\n|\r|\s)*/","",$tmp2);
			}
			$new_str[] = $tmp2;
		}
		$from = $lastIndex;

		if ($tmp[0] == "\"" && !$in_multiline_comment && !$in_singleline_comment) {
			preg_match("/(\\\\)*$/",$lc,$tmp2);
			if (!$in_string || !$tmp2 || (strlen($tmp2[0]) % 2) == 0) {	// start of string with ", or unescaped " character found to end string
				$in_string = !$in_string;
			}
			$from--; // include " character in next catch
			$rc = substr($json,$from);
		}
		else if ($tmp[0] == "/*" && !$in_string && !$in_multiline_comment && !$in_singleline_comment) {
			$in_multiline_comment = true;
		}
		else if ($tmp[0] == "*/" && !$in_string && $in_multiline_comment && !$in_singleline_comment) {
			$in_multiline_comment = false;
		}
		else if ($tmp[0] == "//" && !$in_string && !$in_multiline_comment && !$in_singleline_comment) {
			$in_singleline_comment = true;
		}
		else if (($tmp[0] == "\n" || $tmp[0] == "\r") && !$in_string && !$in_multiline_comment && $in_singleline_comment) {
			$in_singleline_comment = false;
		}
		else if (!$in_multiline_comment && !$in_singleline_comment && !(preg_match("/\n|\r|\s/",$tmp[0]))) {
			$new_str[] = $tmp[0];
		}
	}
	$new_str[] = $rc;
	return implode("",$new_str);
}

/**
 * Found on http://stackoverflow.com/questions/2637945/getting-relative-path-from-absolute-path-in-php
 * 
 * @param string $from
 * @param string $to
 * @return string
 */
function getRelativePath($from, $to) {
    $from = str_replace('\\', '/', realpath($from));
    $to   = str_replace('\\', '/', realpath($to));
    
    $patha = explode('/', $from);
    $pathb = explode('/', $to);
    $start_point = count(array_intersect($patha,$pathb));
    while($start_point--) {
        array_shift($patha);
        array_shift($pathb);
    }
    $output = "";
    if(($back_count = count($patha))) {
        while($back_count--) {
            $output .= "../";
        }
    } else {
        $output .= './';
    }
    return $output . implode('/', $pathb);
}





// ---------------------------------------------------------
// Modules parsing functions
// ---------------------------------------------------------

/**
 * Takes a json file and returns an stdClass object
 * 
 * @param string $pathJsonFile
 * @return stdClass
 */
function parseJsonFile($pathJsonFile, $assoc = FALSE)
{
    // Get Json data from file, clean and decode it
    if(file_exists($pathJsonFile) === FALSE)
        return FALSE;
    
    $jsonContent = file_get_contents($pathJsonFile);
    $result = json_minify($jsonContent);
    return json_decode($result, $assoc);
}



/**
 * Transform multi dimensionnal modules array in a simple array
 * 
 * @param array $modules
 * @return array
 */
function flatListModules(array $modules) {
    $target = array();
    foreach ($modules as $module) 
    {
        if(array_search($module->name, $target) === FALSE)
            $target[] = $module->name;
        
        if(isset($module->modules)) {
            foreach ($module->modules as $moduleName) {
                if(array_search($moduleName, $target) === FALSE) {
                    $sub_modules = modulesFromCategory($moduleName, $modules);
                    
                    $target[] = $moduleName;
                    if(is_array($sub_modules) && count($sub_modules) > 0) {
                        $n_modules = array_diff($target, $sub_modules);
                        $target = array_merge($n_modules, $sub_modules);
                    }
                }
            }
        }    
    } 
    
    return $target;
}

/**
 * Get module wink of a category of modules
 * 
 * @param string $moduleName
 * @param array $modules
 * @return array or NULL
 */
function modulesFromCategory($moduleName, array $modules) {
    foreach ($modules as $module) {
        if($moduleName == $module->name) {
            return isset($module->modules) ? $module->modules : NULL;
        }
    }
}

/**
 * Write a json in file
 * 
 * @param string $fileDestPath
 * @param mixed $json
 * @throws Exception
 * @result boolean
 */
function writeJsonFile($fileDestPath, $json)
{
    $handle = fopen($fileDestPath, 'w+');
    if($handle === FALSE)
        throw new Exception('Can\'t create the file "'.$fileDestPath.'"');
    
    $jsonStr = $json;
    if(is_array($json) || is_object($json))
        $jsonStr = json_encode ($json);
    
    $res = TRUE;
    if(fwrite($handle, $jsonStr) === FALSE)
        $res = FALSE;
    
    fclose($handle);
    return $res;
}

/**
 * Parse a list of modules and returns them into an array
 * 
 * @param array $listModules
 * @return array
 */
function parseListModule(array $listModules)
{
    $result = array();
    foreach ($listModules as $module)
    {
        if(isset($module->modules))
            $result = parseGroupModule ($module, $result);
        
        if(isset($module->defaultImpl))
            $result = parseModule ($listModules, $module, $result);
    }
    
    return $result;
}

/**
 * Parse the input JS file and return the dependencies
 * 
 * @param string $modulePathFile
 * @return array
 */
function getDependencies($modulePathFile, array $listModules)
{
    $jsPathFile = WINK_DIRECTORY.'/'.$modulePathFile;
    if(file_exists($jsPathFile) === FALSE)
        return FALSE;
    
    $content = file_get_contents($jsPathFile);
    
    $result=array();
    preg_match('/define\(\[(.+)\]/i', $content, $result);
    
    // if no dependencies
    if(count($result) < 2)
        return array();
    
    $target = $result[1];
    $strCleaned = str_replace(array("'", "../"), '', $target);
    $list_deps = explode(', ', $strCleaned);
    
    $list_result = array();
    foreach ($list_deps as $path) {
        // Exception for the core
        if(preg_match('/core/', $path)) {
            $list_result[] = 'core';
            continue;
        }
        
        $module = getModuleDetailsFromPath ($path, $listModules);
        if($module !== FALSE) {
            $list_result[] = $module->name;
        }
    }
    
    return $list_result;
}

/**
 * Parse a group of modules and completes the result array passed as arguments
 * 
 * @param mixed $module
 * @param array $result
 * @return array
 */
function parseGroupModule($module, array $result)
{
    if(!isset($result[$module->name])) {
        $result[$module->name] = array(
            "name" => $module->name,
            "path" => NULL,
            "children" => array()
        );    
    }
    
    foreach ($module->modules as $sub_modules) 
    {
        $result[$sub_modules] = array(
            "name" => $sub_modules,
            "path" => NULL,
            "parent" => $module->name
        );
        
        $result[$module->name]["children"][] = $sub_modules;
    }
    
    
    return $result;
}

/**
 * Parse a module and completes the result array passed as arguments
 * 
 * @param mixed $module
 * @param array $result
 * @return array
 */
function parseModule(array $listModules, $module, array $result)
{
    if(!isset($result[$module->name])) {
        $result[$module->name] = array(
            "name" => $module->name
        );    
    }
    
    $result[$module->name]["path"] = $module->defaultImpl;
    $result[$module->name]["requirements"] = 
        getDependencies($module->defaultImpl, $listModules);
    
    return $result;
}

/**
 * Get the name, the path and others data for a module from this name
 * 
 * @param string $moduleName
 * @param array $listModule
 * @return array
 */
function getModuleDetailsFromName($moduleName, array $listModule)
{
    foreach ($listModule as $module) {
        if($moduleName == $module->name)
            return $module;
    } return FALSE;
}

/**
 * Get the module's name from this path
 * 
 * @param string $modulePath
 * @param array $listModule
 * @return array
 */
function getModuleDetailsFromPath($modulePath, array $listModule) {
    foreach ($listModule as $module) {
        if(isset($module->defaultImpl)
        && $modulePath.'.js' == $module->defaultImpl)
            return $module;
    } return FALSE;
}

/**
 * Get the module position in the list or -1 if not found
 * 
 * @param string $moduleName
 * @param array $listModule
 * @return int
 */
function getModuleKey($moduleName, array $listModule) {
    foreach ($listModule as $k => $module) {
        if($module->name == $moduleName)
            return $k;
    } return -1;
}



// ---------------------------------------------------------
// Wink specifics functions
// ---------------------------------------------------------

/**
 * Get the list of wink themes
 * 
 * @param string $themes_directory
 * @return array
 */
function wink_get_themes($themes_directory)
{
    $dir_handle = opendir($themes_directory);
    if($dir_handle === FALSE)
        return FALSE;
    
    $themes = array();
    while(FALSE !== ($f = readdir($dir_handle))) 
        if(is_dir($themes_directory.'/'.$f)
        && ($f != '.' && $f != '..'))
            $themes[] = $f;
        
    closedir($dir_handle);
        
    return $themes;
}

