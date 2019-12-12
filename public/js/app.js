const sidebar = document.querySelector('#sidebar');

//#region Event Listeners
if(document.querySelector('#navDrawerBtn')){ //check if navbar on page
    document.querySelector('#navDrawerBtn').addEventListener('click', (event)=>{
        sidebar.style.display = 'flex';
        document.querySelector('#sidebar-overlay').style.display = 'initial';
    })
}
if(document.querySelector('#sidebar-overlay')){
    document.querySelector('#sidebar-overlay').addEventListener('click', (event)=>{
        sidebar.style.display = 'none';
        document.querySelector('#sidebar-overlay').style.display = 'none';
    })
}
    