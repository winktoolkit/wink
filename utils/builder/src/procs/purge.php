<?php

require_once dirname(__FILE__).'/../inc/config.php';
require_once dirname(__FILE__).'/../inc/functions.inc.php';

$dir_handle = opendir(PROJECT_BUILD_DIR);
if($dir_handle === FALSE) 
    throw new Exception('Can\'t open the directory "'.PROJECT_BUILD_DIR.'"');

// Walk through the directory
while(FALSE !== ($f = readdir($dir_handle))) 
{
    $path = PROJECT_BUILD_DIR.'/'.$f;

    // Continue if the current or previous folder
    if($f == '.' && $f == '..')
        continue;

    // Continue if it's not a folder
    if(is_dir($path) === FALSE)
        continue;

    // Check the time
    $diff_time = time() - filemtime($path);
    $expired_in_sec = EXPIRED_TIME * 3600;
    if($diff_time > $expired_in_sec)
        rrmdir($path);
}
