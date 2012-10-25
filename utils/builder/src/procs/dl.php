<?php

require_once dirname(__FILE__).'/../inc/config.php';
require_once dirname(__FILE__).'/../inc/functions.inc.php';

try
{
    $guid = get('id');
    if($guid == '') 
        throw new Exception('The parameter is not correct');

    if(is_dir(PROJECT_BUILD_DIR.'/'.$guid) === FALSE)
        throw new Exception('The build doesn\'t exist');

    $pathZipFile = PROJECT_TMP_DIR.'/'.uniqid(time()).'.zip';

    $zip = new ZipArchive();
    if($zip->open($pathZipFile, ZipArchive::CREATE) !== TRUE)
        throw new Exception('Zip file creation failed');

    $zip = zip_directory(PROJECT_BUILD_DIR.'/'.$guid, $zip);
    $zip->close();

    if(file_exists($pathZipFile) !== TRUE)
        throw new Exception("The file doesn't exist");

    $res = searchInDir(array('\.(js)$'), PROJECT_BUILD_DIR.'/'.$guid, TRUE);
    $zipFilename = str_replace('.min.js', '.zip', basename($res[0]));

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="'.$zipFilename.'"');
    header('Content-Length: '.filesize($pathZipFile));
    readfile($pathZipFile);
    unlink($pathZipFile);
    exit();
}
catch (Exception $e) {
    echo $e->getMessage();
}
