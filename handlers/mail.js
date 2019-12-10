var nodemailer=require("nodemailer");
var pug=require("pug");
var juice=require("juice");
var htmltotext=require("html-to-text");


var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "468d5da3601667",
      pass: "75d1831f76fe4c"
    }
  });

// transport.sendMail({
//     from:"abhicahuhan5682@gmail.com",
//     to:"abhi@example.com",
//     subject:" love you",
//     text:"thslhslhldshldshgls fghglhglsdg jvjljvjddjv"
// });

exports.send =function(options) {
    var MailOptions={
        from:"ABHI CHAUAHAN <abhichauhan5682@gmail.com>",
        to:options.user.email,
        subject:options.subject,
        html:"this will befilled later",
        text:options.resetURL
    };
    transport.sendMail(MailOptions,function(err,info) {
       if(err){
           console.log(err);
       }else{
           console.log(info.envelope);
           console.log(info.messageId);
       } 
    });
    
}
