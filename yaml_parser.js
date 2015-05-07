var fs = require('fs');
var yml = require('js-yaml');

var input_file = "";

// stdin argument parsing
for (var i = 0; i < process.argv.length; i++) {
    switch(process.argv[i])
    {
        case "-i":
            var input_file = process.argv[++i];            
            break;
    }
}

if(!input_file) {
	console.log("no input. aborting...");
	return;
}

// read input file
var input_data = fs.existsSync(input_file) ? fs.readFileSync(input_file, 'utf8') : "";
	
if(!input_data) {
	console.log("no input. aborting...");
	return;
}

// if we have a valid input -- load out template
var output_data = fs.existsSync("template/mongoose_schema_template.js") ? fs.readFileSync("template/mongoose_schema_template.js", 'utf8') : "";

if(!output_data) {
	console.log("missing template/schema_template.js! aborting...");
	return;
}

// parse input as YAML -- validation
var yml_data = yml.safeLoad(input_data);

if(!yml_data.hasOwnProperty('name')) {
	console.log("missing 'name' for the schema. aborting...");
	return;
}

var content = [];
var required_fields = [];
var all_fields = [];

for(k in yml_data) {
	if(k === 'name') continue;

	var v = yml_data[k];

	// type
	var type = (v && v.hasOwnProperty('type')) ? v['type'] : "String";	

	// check if entry has fields (i.e: curator -> curator_name, curator_title, etc...)
	var fields = fields_check(v);

	// todo: Array (*important*)
	if(type instanceof Array) {
		console.log('array');
	} else {

		// required field?
		if(v && v.hasOwnProperty('required') && v['required'])

			// dealing with a field (i.e: curator -> curator_name, curator_title, etc...)
			if(fields.length > 0)

					// generate field entry -- (i.e: curator_name, curator_title, etc...)
					for(f in fields) {
						var name = k + "_" + fields[f];
						content.push("\t" + name + ": {type: " + type + "± required: true}");
						required_fields.push('\'' + name + '\'');
						all_fields.push("\t\t\t" + '\'' + name + '\'');
					}
			else {
				// generate entry
				content.push("\t" + k + ": {type: " + type + "± required: true}");
				required_fields.push('\'' + k + '\'');
				all_fields.push("\t\t\t" + '\'' + k + '\'');
			}
				
		else
			// dealing with a field (i.e: curator -> curator_name, curator_title, etc...)
			if(fields.length > 0)
				// generate field entry -- (i.e: curator_name, curator_title, etc...)
					for(f in fields) {
						var name = k + "_" + fields[f];
						content.push("\t" + name + ": " + type);
						all_fields.push("\t\t\t" + '\'' + name + '\'');
					}
			else {
				// generate entry
				content.push("	" + k + ": " + type);
				all_fields.push("\t\t\t" + '\'' + k + '\'');
			}
	}
}

// (readable) formating

var content_str = content.toString().replace(/,/g, ',\n').replace(/±/g, ',');

var required_fields_str = required_fields.toString();

var all_fields_str = all_fields.toString().replace(/,/g, ',\n');

output_data = output_data.replace('<formated>', content_str)
	.replace('<required_fields>', required_fields_str)
	.replace('<all_fields>', all_fields_str)
	.replace(/<Name>/g, yml_data.name);

// output to stdout -- hence -- unix piping + redirect
console.log(output_data);

function fields_check(obj) {
	var res = [];
	if(obj)
		for(e in obj) {
			if(e.slice(0, 3) !== 'min' && e.slice(0, 3) !== 'max' && e !== 'required' && e !== 'type') {
				res.push(e);
			}
		}
	return res;
}






