==============================================
WINK LOADER
==============================================

GOALS
==============================================
- Wink loader allows to load the appropriate source code

- The user has the choice between let the loader target dectection or give the expected target

- The loader exists in two versions :
  - one to load development source files
  - one other to load a builded file


HOW TO USE
==============================================
- in development mode : 

------------------------------------------------------------------------
<script type="text/javascript" src="../loader_dev.js"></script>
<script type="text/javascript">
winkloader.load({
	winkPath: '../../../',
	moduleConf: '../../build/conf/modules.json',
	profileConf: '../../build/conf/profiles.json',
	profile: 'my_profile',
	callback: function() {}
});
</script>
------------------------------------------------------------------------

- the development loader relies on modules and profiles configuration to gather sources

- if "target" parameters is not given, it force the loader target detection

- the callback is invoked when all sources are loaded

- in builded mode : 

------------------------------------------------------------------------
<script type="text/javascript" src="../loader.js"></script>
<script type="text/javascript">
winkloader.load({
	buildPath: '../../build/wink/js/',
	version: '1.4.0',
	profile: 'my_profile',
	callback: function() { }
});
</script>
------------------------------------------------------------------------

- the loader relies on the composition of the builded file name to identify the appropriate builded file to load

- "ismin" parameter is available in order to get the minimized script or not


HOW TO UPGRADE
==============================================
- the sources of the loaders are in "loader/src" directory

- the "loader/build/build.xml" allows to produce minimized loaders scripts in "loader" directory

- the "loader/src/loader_helper_src.js" script is shared between the two loaders
  and defines the "detectTarget" function that may be interesting to improve as needed
