var fs = require('fs');
var yml = require('js-yaml');

var input_file = "";

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

var input_data = fs.existsSync(input_file) ? fs.readFileSync(input_file, 'utf8') : "";
	
if(!input_data) {
	console.log("no input. aborting...");
	return;
}

var output_data = fs.existsSync("template/mongoose_schema_template.js.js") ? fs.readFileSync("template/mongoose_schema_template.js.js", 'utf8') : "";

if(!input_data) {
	console.log("missing template/schema_template.js! aborting...");
	return;
}

var yml_data = yml.safeLoad(input_data);

var content = [];

var required_fields = [];
var all_fields = [];

for(k in yml_data) {
	if(k === 'name') continue;
	var v = yml_data[k];
	var type = (v && v.hasOwnProperty('type')) ? v['type'] : "String";	
	var fields = fields_check(v);
	if(type instanceof Array) {
		console.log('array');
	} else {
		if(v && v.hasOwnProperty('required') && v['required'])
			if(fields.length > 0)
					for(f in fields) {
						var name = k + "_" + fields[f];
						content.push("\t" + name + ": {type: " + type + "± required: true}");
						required_fields.push('\'' + name + '\'');
						all_fields.push("\t\t\t" + '\'' + name + '\'');
					}
			else {
				content.push("\t" + k + ": {type: " + type + "± required: true}");
				required_fields.push('\'' + k + '\'');
				all_fields.push("\t\t\t" + '\'' + k + '\'');
			}
				
		else
			if(fields.length > 0)
					for(f in fields) {
						var name = k + "_" + fields[f];
						content.push("\t" + name + ": " + type);
						all_fields.push("\t\t\t" + '\'' + name + '\'');
					}
			else {
				content.push("	" + k + ": " + type);
				all_fields.push("\t\t\t" + '\'' + k + '\'');
			}
	}
}


var content_str = content.toString().replace(/,/g, ',\n').replace(/±/g, ',');

var required_fields_str = required_fields.toString();

var all_fields_str = all_fields.toString().replace(/,/g, ',\n');

output_data = output_data.replace('<formated>', content_str)
	.replace('<required_fields>', required_fields_str)
	.replace('<all_fields>', all_fields_str)
	.replace(/<Name>/g, yml_data.name);

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






