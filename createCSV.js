var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database.sqlite');

var ids = []
db.all("SELECT * FROM chats", (error, rows) => {
    rows.forEach(row => {
        var id = row.id
        db.serialize(function() {

            db.all(`
				  SELECT  time, text, username, users.id, first_name, last_name, chats.name FROM messages INNER JOIN chats ON messages.source_id = chats.id
				  LEFT JOIN users ON messages.sender_id = users.id
				  WHERE source_id='${id}';
				`, function(err, rows) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    addRowToDataCSV(rows, id);
                }
            });
        })

    });
});
/*
 * adds row to local var, process the whole db with the new row and writes it to a file
 * this is awful code style!
 */
function addRowToDataCSV(rows, chat_id) {
    // console.log('This are our results: ', rows);
    var csvResult = "";
    rows = sortRows(rows);
    for (let row of rows) {
        console.log(row)
        csvResult = `${csvResult}${row.name},${row.first_name}\n`
            // single row stored in row: username accesable by using: row.username and so on
            // explore the row object by using console.log(row)
            // it is possible to change the content of a row
    }
    //sort our rows by time and 
    //write rows to file
    fs.writeFile('./chats/chat '.concat(chat_id).concat('.csv'), csvResult, 'utf8', function(err) {
        if (err) console.log(err);
    });
}

/*
 * process full db data set aka json
 */
function sortRows(rows) {
    rows.sort(compare);
    rows.reverse();
    return rows
}
/*
 * compare function
 */
function compare(a, b) {
    return a.time - b.time;
}
