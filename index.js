var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path');
const port = process.env.PORT || 3000;
const mysql = require('mysql');

app.get('/', function(req, res){
    const filePath = path.join(__dirname, 'test.html');
    res.sendFile(filePath);
});

let max = 10;
let min = 1;

//Whenever someone connects this gets executed
io.on('connection', function(socket){
    console.log('A user connected');
    const generateRandomNumber = () => {
    // Get the maximum and minimum values for the random number.

    // Multiply the result of Math.random() by a factor to get a random number between 0 and 100.
    const randomNumber = Math.random() * max;

    // Add the minimum value to get a random number between 1 and 100.
    const roundedRandomNumber = randomNumber + min;

    // Round the random number to two decimal places using toFixed().
    const finalRandomNumber = roundedRandomNumber.toFixed(2);

    // Return the final random number.
    return finalRandomNumber;
    };

    // Generate and print a random number.
    const startProgram = () => {
        // Generate and print a random number.
        //const randomNumber = generateRandomNumber();
    
        // Send a message when
        setTimeout(function(){
            // Sending an object when emitting an event
            socket.emit('working', '1');
        }, 1000);
        setTimeout(function(){
            // Sending an object when emitting an event
            socket.emit('prepareplane', '6');
        }, 1000);
        setTimeout(function(){
            // Sending an object when emitting an event
            socket.emit('flyplane', '7');
        }, 1000);
    
        var x = 1.00;
        setTimeout(function(){
            const randomNumber = generateRandomNumber();
            const myInterval = setInterval(function(){
                // Sending an object when emitting an event
                x = parseFloat((x + 0.01).toFixed(2));
                socket.emit('crash-update', x.toFixed(2));
                if (x >= randomNumber) {
                    // Stop the interval
                    clearInterval(myInterval);
                    socket.emit('updatehistory', x);
                    socket.emit('reset', x);
                    setTimeout(function(){
                        socket.emit('removecrash', x);
                        max = 10;
                        // Restart the program after 1 second
                        setTimeout(startProgram, 5000);
                    }, 3000);
                }
            }, 100);
        }, 2000);
    };
    
    // Start the program for the first time
    startProgram();
   
   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
   socket.on('newBet', function (s, t) {

//        const connectiona = mysql.createConnection({
       // host: '216.10.241.6',
       // user: 'mmudrcsc_sonpal',
       // password: 'wElcom@2012',
       // database: 'mmudrcsc_fastwin'
       // });
        const connection = mysql.createPool({
          host: '216.10.241.6',
          user: 'mmudrcsc_sonpal',
          password: 'wElcom@2012',
          database: 'mmudrcsc_fastwin',
          //port: '3306'
      
      });
           
       //max = 0.09;
       
      const checkbalanceQuery = 'SELECT * FROM users WHERE username = ?';
      
      connectiona.query(checkbalanceQuery, [s], function (error, userResults) {
        if (error) {
          console.error('Error executing query:', error);
          return;
        }
        
        if (userResults.length === 0) {
          console.error('User not found');
          return;
        }
        
        const balance = userResults[0].balance;
        const newbalance = (balance - t).toFixed(2);
        
        const updateQuery = 'UPDATE users SET balance = ? WHERE username = ?';
        connectiona.query(updateQuery, [newbalance, s], function (error, updateResults) {
          if (error) {
            console.error('Error updating data:', error);
            return;
          }
          console.log('User balance updated successfully');
          
          const insertQuery = 'INSERT INTO crashbetrecord (username, amount) VALUES (?, ?)';
          connectiona.query(insertQuery, [s, t], function (error, insertResults) {
            if (error) {
              console.error('Error inserting data:', error);
              return;
            }
            console.log('Data inserted into crashbetrecord successfully');
            
			let xc = 1;
            const maxcrashQuery = 'SELECT * FROM crashgamerecordtwo WHERE id = ?';
            connectiona.query(maxcrashQuery, [xc], function (error, maxcrashResults) {
                if (error) {
                  console.error('Error executing query:', error);
                  return;
                }
                max = maxcrashResults[0].crashpoint;
                connectiona.end(); //Caused trouble after one bet
              });
			
            //connectiona.end(); Caused trouble after one bet
          });
        });
      });
    });
    socket.on('addWin', function (s, t, e) {

        const connectionb = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
        });
        
        const checkbalanceQueryz = 'SELECT * FROM users WHERE username = ?';
      
        connectionb.query(checkbalanceQueryz, [s], function (error, userResultsz) {
        if (error) {
          console.error('Error executing query:', error);
          return;
        }
        
        if (userResultsz.length === 0) {
          console.error('User not found');
          return;
        }
        
        const balancez = userResultsz[0].balance;
        const newbalancez = (balancez + t * e).toFixed(2);
        
            const updateQueryz = 'UPDATE users SET balance = ? WHERE username = ?';
            connectionb.query(updateQueryz, [newbalancez, s], function (error, updateResultsz) {
              if (error) {
                console.error('Error updating data:', error);
                return;
              }
              console.log('User balance updated successfully');
              
                var suc = 'success';
                const updatecrashQueryz = 'UPDATE crashbetrecord SET status = ?, winpoint = ? WHERE username = ? ORDER BY id DESC LIMIT 1';
                connectionb.query(updatecrashQueryz, [suc, e, s], function (error, updateResultsz) {
                  if (error) {
                    console.error('Error updating data:', error);
                    return;
                  }
                  console.log('Crash Bet Record updated successfully');
                    connectionb.end();
                });
            });
        });
    });

});
http.listen(port, function(){
   console.log('listening on *:${port}');
});
