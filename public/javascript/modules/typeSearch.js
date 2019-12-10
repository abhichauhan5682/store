//var axios=require("axios");
function typeAhead(search){
   if(!search){
       return;
   }
   var searchInput=search.querySelector('input[name="search"]');
   var searchResults=search.querySelector(".search__results");

   searchInput.addEventListener("input",function(){
       console.log(this.value);
   });

};
//export default typeAhead; 