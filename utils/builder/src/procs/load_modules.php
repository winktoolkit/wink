<?php

// Load required files
require_once dirname(__FILE__).'/../inc/config.php';
require_once dirname(__FILE__).'/../inc/functions.inc.php';

// Parse and get modules
$listModules = parseJsonFile(WINK_DIRECTORY.'/utils/build/conf/modules.json');
$res = parseListModule($listModules->modules);

// Return to json format
echo json_encode(array('result' => $res));
exit;
