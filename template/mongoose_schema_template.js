var mongoose = require('mongoose');

var <Name>;

var <Name>Schema = new mongoose.Schema({
<formated>
});

<Name>Schema.statics.getFields = function getFields() {
	var fields = {
		requiredFields: [<required_fields>],
		allFields: [
<all_fields>
		]
	};
	return fields;
};

<Name> = mongoose.model("<Name>", <Name>Schema);

module.exports = <Name>;
