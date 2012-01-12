==============================================
WINK BUILD SYSTEM
==============================================

GOALS
==============================================
- Wink build system allows to produce custom builded files of the wink source

- The main goal is to package the code to fit wink as efficiently as possible to the execution context

- it lets you build a target file in a given profile, a profile is a set of modules

- it manages the various implementations of code related to targets, eliminating duplicate code that does not match the target

- it produces a build file for each "profile / target" combination

- there are two separate processes that produce, on the one hand, the JS files, and on the other hand, the CSS files

HOW TO USE
==============================================
- directory structure is :

  - utils/build
    - conf				: contains modules and profiles configuration
    - libs				: JARs that allow to build
    - scripts			: contains the main execution scripts
    - src				: contains the Java sources which manage parsing and abstract model manipulation
    - test				: contains the Java test sources
    - build.properties	: the build configuration
    - build.xml			: contains the ANT targets to launch the build process

- To launch the build process, just launch the default ant task

- A specific task allow to build the wink builder JAR from Java sources


CONFIGURATION
==============================================
- conf/modules.json 
  - contains the definition of the modules
  - each module has a name, a default JS implementation file, optionals specific JS sub-implementation files, a list of associated CSS files, and a list of i18n files
  - the default implementation is included with the sub-implementation (by default), but the user can exclude this with the option "excludeDefault"
  - the definition of a module can also be a set of other modules (group)

----------------------------------------
{
	"modules": [
		{
			"name": "moduleA",
			"defaultImpl": "path/to/moduleA.js"
		},
		{
			"name": "moduleB",
			"defaultImpl": "path/to/moduleB.js",
			"css": [ css files list ],						// optional
			"i18n": [										// optional
				{ "en_EN": "path/to/moduleB_en_resources.js" },
				{ "fr_FR": "path/to/moduleB_fr_resources.js" }
			]
		},
		{
			"name": "moduleC",
			"defaultImpl": "path/to/moduleC.js",
			"subImpls": [									// optional
				{
					"target": "targetA",
				    "impl": "path/to/moduleC_targetA.js",
					"excludeDefault": true | false			// optional
				}
			]
		},
		{
		    "name": "groupModule1",
		    "modules": [ 
		        "moduleA",
		        "moduleB"
		    ]
		},
		{
		    "name": "groupModule2",
		    "modules": [ 
		        "groupModule1",
		        "moduleC"
		    ]
		}
	]
}
----------------------------------------

- conf/profiles.json 
  - contains the definition of the profiles
  - each profile has a name, a list of modules, and an optional list of CSS files ; all named module must match one in the module definition
  - each profile may be associated to a list of dependencies (modules) that may be needed to build the profile
  - each profile may be configured with a list of locales used for internationalization ; if none is specified, the global "defaultLocaleList" is used
  - it is also possible to define a new module name (in the implementations section) in order to associate it to other modules implementations depending on a given target
  - it is also here where you can spend the features resolved so that the build replaces the corresponding tests
  - The replacement of these tests can be done either in all files or only for profiles and targets specified

----------------------------------------
{
	"build": {
		"jsFile": "wink-VERSION-PROFILE-TARGET.js",
		"cssFile": "wink-VERSION-PROFILE-TARGET.css",
		"version": "x.y.z",
		"defaultLocaleList": [ "en_EN" ]
	},
	"profiles": [
		{
			"name": "profileName",
			"modules": [ module list ],
			"css": [ css files list ],		// optional
			"dependencies": [				// optional
				module dependency list
			],
			"localeList": [ locale list ]	// optional
		}
	],
	"features": [							// optional
	    {
	        "name": "featureName",
	        "value": true | false,
	        "profiles": [ profile list ],	// optional
	        "targets": [ target list ]		// optional
	    }
	],
	"implementations": [					// optional
		{
			"module": "moduleName",
			"defaultImpl": "moduleA",
			"subImpls": [
				{
					"target": "targetA",
					"impl": "moduleB"
				},
				{
					"target": "targetB",
					"impl": "moduleC"
				}
			]
		}
	]
}
----------------------------------------

- build.properties contains all the parameters of the build :
  - paths definitions (src, jars, conf ...)
  
  - build.targets : expected targets (optional), if not specified all detected targets in configuration are used 
  
  - build.profiles : expected profiles (optional), if not specified all detected profiles in configuration are used 
  
  - some debug options


REQUIREMENTS & LIMITATIONS
==============================================
- the source code must not contain syntax errors to be builded

- A "defaultImpl" is required for each module definition

- The order of modules in a profile definition is to consider (eg. ordered core modules first)

- A module can have only one single definition level of sub-implementation

- The build system is based on a parsing task that impose some syntax restrictions :

  - newline is expected before each literal and function declaration
  
  - ',' or ';' is expected at the same line as the last right brace of each function that needs one of these characters

  - a function is considered as redefined by a sub-impl file only if it has the same name and the same parameters

- extend a literal with a wink.json.concat expression does not benefit from optimization to remove duplicate code


HOW IT WORKS
==============================================
- build.xml has a "build_jar" target that package the libs/wink/winkbuilder.jar (based on Rhino)

- build.xml has a "build_js" target that launch the JS Build process via the Java main process with build.properties parameters as arguments

- build.xml has a "build_css" target that launch the CSS Build process via the Java main process with build.properties parameters as arguments

- build.xml has a main "build_wink" target that launch JS Build, CSS build and minimization processes

- the java process instantiate a WinkBuilder Object that executes the JS scripts (build.js, buildCss.js, wink_build_utils.js)
  it put the main arguments into the JS environnement

- [ build.js / buildCss.js ] processes

  - parse and analyse module and profile conf
  
  - identify working targets based on expected and detected targets in conf

  - identify working profiles based on expected and detected profiles in conf
  
  - for each "profile / target" combination :
  
    - identify the modules to package and resolve module implementation if exists
    
    - identify the sub-modules of the group definitions
    
    - identify implementation files for each module and append sub-implementations if the target matches
    
    - build a file with the list of files elaborated from previous identifications

    - [ build.js specifics ]
    
      - replaces the feature tests by given values defined in the profile configuration
    
      - parse the files and elaborate the abstract model in order to remove duplicates code declarations
    
      - build the uncompressed build file by concatenation of temporary working files
      
    - [ buildCss.js specifics ]
    
      - build the uncompressed build file by concatenation of temporary working files
