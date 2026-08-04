let btn=document.querySelectorAll("button");
let input=document.querySelector("input");

let string="";


let arr=Array.from(btn);
btn.forEach(button=>{
    button.addEventListener("click", (e)=>{
    if(e.target.innerHTML=="="){
        string=eval(string);
        input.value= string;
    }
    else if(e.target.innerHTML=="AC"){
        string=" ";
        input.value= 0;
    }
    else if(e.target.innerHTML=="DEL"){
       string= string.substring(0, string.length-1);
    }
    else{
        string+=e.target.innerHTML;
        input.value=string;
    }
})
})