'use strict';

let runtime = require('./runtime');
const dataformatter = require('./dataformatter');

class DataFormatter {
	static SendResponse(_message, _data, res) {

        let response = {
            api_version: runtime.version,
            data: _data
        }
        response.data.message = _message;

        res.send(response);
    }
}

module.exports = DataFormatter;