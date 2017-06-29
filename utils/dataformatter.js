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

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(response);
    }
}

module.exports = DataFormatter;