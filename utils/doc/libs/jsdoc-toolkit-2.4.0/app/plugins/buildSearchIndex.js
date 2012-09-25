JSDOC.PluginManager.registerPlugin("JSDOC.buildSearchIndex", {
	onClassPublish: function(arg) {
		try {
			var indexEntry = "s[" + SearchIndexContainer.currentCounter + "] = \"";
			var link = (new Link()).toClass(arg.symbol.alias).toString();
			link = link.match(/<a href="(.*)"(.*)/)[1];
			indexEntry += arg.symbol.alias + "^" + link + "^";
			if (arg.symbol.classDesc != "")  {
				var desc = arg.symbol.classDesc.replace(/[\r\n]+/g, "");
				desc = desc.replace(/["]+/g, "");
				indexEntry += desc + " ";
			}	
			
			var properties = arg.symbol.properties;
			for (var name in properties) {
				if (typeof(properties[name].name) == "string" && properties[name].name != "") {
					indexEntry += properties[name].name + " : ";
				}
				if (typeof(properties[name].desc) == "string" && properties[name].desc != "") {
					var desc = properties[name].desc.replace(/[\r\n]+/g, "");
					desc = desc.replace(/["]+/g, "");
					indexEntry += desc + " , ";
				}
			}
			indexEntry += " | ";
			var methods = arg.symbol.getMethods();
			for (var name in methods) {
				if (typeof(methods[name].name) == "string" && methods[name].name != "") {
					indexEntry += methods[name].name + " : ";
				}
				if (typeof(methods[name].desc) == "string" && methods[name].desc != "") {
					var desc = methods[name].desc.replace(/[\r\n]+/g, "");
					desc = desc.replace(/["]+/g, "");
					indexEntry += desc + " , ";
				}
			}
			
			indexEntry += "\";\n\r";
			
			SearchIndexContainer.fileIndexString += indexEntry;
			SearchIndexContainer.currentCounter++;
		} catch (e) {
			var name = "Alias not found";
			if (arg != null && arg.symbol != null && arg.symbol.alias != null) {
				name = arg.symbol.alias;
			}
			var exception = ""
			for (var entry in e) {
				exception += entry + ":" +e[entry] + ", "; 
			}
			
			if (LOG) LOG.warn("Error processing " + name + " on build search index. Exception: " + e);
		}
	},
	
	afterFileProcess: function(directories) {
		IO.mkPath((directories.outDir+"search").split("/"));
		IO.saveFile(directories.outDir + "search", "tipue_data.js", SearchIndexContainer.fileIndexString);
		IO.copyFile(directories.templatesDir+"search/index.html", directories.outDir+"search/");
		IO.copyFile(directories.templatesDir+"search/results.html", directories.outDir+"search/");
		IO.copyFile(directories.templatesDir+"search/styles.css", directories.outDir+"search/");
		IO.copyFile(directories.templatesDir+"search/tipue_set.js", directories.outDir+"search/");
		IO.copyFile(directories.templatesDir+"search/tipue.js", directories.outDir+"search/");
	}
});

var SearchIndexContainer = {
	fileIndexString : "var s = new Array();\n\r",
	currentCounter : 0
}
