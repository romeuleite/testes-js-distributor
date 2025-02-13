const dataaccess = {
    remove: function(collection, query, callback) {
      // Simulando um erro
      const error = new Error('Erro simulando falha no banco');
      //callback(error);  // Chamando o callback com o erro
      callback(null);  // Chamando o callback com null indicando sucesso
    }
  };
  
  const moduledbNamesbookingName = 'nomeBooking'
  
  
  function cancelBooking(bookingid, userid, callback /*(error)*/) {
      dataaccess.remove(moduledbNamesbookingName,{'_id':bookingid, 'customerId':userid}, callback)
  }
  
  const number = 1;
  const userid = 123;
  
  
  cancelBooking(number, userid, function (error) {
      if (error) {
          console.log('status : error');
      }
      else {
          console.log('status : success');
      }
  });
