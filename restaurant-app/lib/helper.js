var dbConn = require('./db');

module.exports = function(){
      
     this.getOrderNumber = ()=>{
        var retVal = ''; 
        dbConn.query("SELECT * FROM key_control WHERE key_name ='ORDER_NBR'", function(err,row)     {
            // console.log(row[0].key_value);     
            retval = row[0].key_value; 
        });
        return retVal;
    }

     function getOrderPrefix() {
        var retVal = '';  
        dbConn.query("SELECT * FROM key_control WHERE key_name ='ORDER_NBR_PREFIX'", function(err,row)     {
            if(err){ 
                return null;
                   }
            else{ 
                // retVal = row[0].key_value;
                return row.key_value;;      
            }
                           
        });
        // this.returnValue = retVal;
        // return retVal;
    }

    function updateOrderNumber(x){
        var blnRetVal = false;
        var newValue = parseInt(x) + 1;  
        dbConn.query("UPDATE key_control SET key_value = '" + newValue + "' WHERE key_name ='ORDER_NBR_PREFIX'", function(err,row)     {
            if(err){ 
               //
                   }
            else{ 
                blnRetVal = true;      
            }
                           
        });
        return   retVal;
    }
}