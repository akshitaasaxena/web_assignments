function addtodo(){
    let get=document.querySelector("input");
    let li=document.createElement("li");
    if(get.value!=""){
    // li.innerHTML=get.value;
    li.innerHTML=`${get.value}<button onclick="removetodo(this)">delete</button>`;
    
    console.log(li);
    let ul=document.querySelector("ul");
    ul.prepend(li);
    get.value=""; // tea jab usme daal rhe to vaha reh jaar tha. toh usko prepend krne ke baad,
    // usme empty string daal di.
    // The innerHTML property sets or returns the HTML content (inner HTML) of an element. It allows you to manipulate the inner content, including HTML tags, by assigning new HTML strings or retrieving existing content, making it useful for dynamic updates on web pages.

    }
    else{
        alert("value to fill kr de nalayak")
    }
}
function removetodo(element){
    // console.log("remo");
    element.parentElement.remove();


}

