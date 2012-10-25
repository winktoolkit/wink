<?php

/** The project root directory */
define('PROJECT_ROOT', dirname(__FILE__).'/../..');

/** The useful directories of the wink project */
define('WINK_DIRECTORY', PROJECT_ROOT.'/../..');

define('WINK_DIR_BUILD', WINK_DIRECTORY.'/utils/build');
define('WINK_DIR_THEMES', WINK_DIRECTORY.'/_themes');

define('WINK_PATH_XML_BUILD', WINK_DIR_BUILD.'/build.xml');
define('WINK_PATH_PROPERTIES_BUILD', WINK_DIR_BUILD.'/build.properties');
define('WINK_PATH_JSON_MODULES', WINK_DIR_BUILD.'/conf/modules.json');
define('WINK_PATH_JSON_PROFILES', WINK_DIR_BUILD.'/conf/profiles.json');


/** The output directories */
define('PROJECT_TMP_DIR', PROJECT_ROOT.'/tmp');
define('PROJECT_BUILD_DIR', PROJECT_ROOT.'/builds');

/** The time which define the expiration time for a guid */
define('EXPIRED_TIME', 3*24); // in hours => 3*24 = 3 days
