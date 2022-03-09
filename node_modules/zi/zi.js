//zi.js global zi object. depends on jQuery, but let's be real: when do I not use jQeury?

(function(){
  
  var root = this;
    
  zi={};
  zi.config=function(){
      //configure your css here
      var css={
        "body":{
            "font-size":"2em",
            "font-family":"sans-serif",
            "text-align":"center"
        },
        "div":{
            "padding":"30px",
            "margin":"30px",
            "border":"1px solid #555"
        }
      };
      return css;
  };
  zi.transform=function(css){
      var c="";
      for (var selector in css){
          c+=selector+"{";
          for (var property in css[selector]){
              c+=property+" : "+css[selector][property]+";";
          }
          c+="}";
      }
      return c;
  };
  zi.css=function(){
      if (document.getElementById("zi")===null){
        var cssNode = document.createElement("STYLE");
        cssNode.id = "zi";
        cssNode.setAttribute("type","text/css");
        document.head.appendChild(cssNode);
        //$("head").append("<style type='text/css' id='zi'></style>");
      }
      var zi = document.getElementById("zi");
      zi.innerHTML = this.transform(this.config() );
      //$("head style#zi").html( this.transform( this.config() ) );
  };

  
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = zi;
    }
    exports.zi = zi;
  } else {
    root.zi= zi;
  }
        
}).call(this);