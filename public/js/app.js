const sidebar = document.querySelector('#sidebar');

//#region Event Listeners_____________________________________________________________________________________________


// ___________________Sidebar and Drawer________________
if (document.querySelector('#navDrawerBtn')) { //check if navbar on page
    document.querySelector('#navDrawerBtn').addEventListener('click', (event) => {
        sidebar.style.display = 'flex';
        document.querySelector('#sidebar-overlay').style.display = 'initial';
    })
}
if (document.querySelector('#sidebar-overlay')) {
    document.querySelector('#sidebar-overlay').addEventListener('click', (event) => {
        sidebar.style.display = 'none';
        document.querySelector('#sidebar-overlay').style.display = 'none';
    })
}
if (document.querySelector('#close-drawer-btn')) {
    document.querySelector('#close-drawer-btn').addEventListener('click', (event) => {
        sidebar.style.display = 'none';
        document.querySelector('#sidebar-overlay').style.display = 'none';
    })
}


// ___________________PC Nav Profile Button________________
if (document.querySelector('.pc-nav__account-icon')) {
    document.querySelector('.pc-nav__account-icon').addEventListener('click', event => {
        document.querySelector('.pc-nav__account-options').style.display = 'initial';
        document.querySelector('.account-options-overlay').style.display = 'initial';
    })
}
if (document.querySelector('.account-options-overlay')) {
    document.querySelector('.account-options-overlay').addEventListener('click', event => {
        document.querySelector('.pc-nav__account-options').style.display = 'none';
        document.querySelector('.account-options-overlay').style.display = 'none';
    })
}

//#endregion Event Listeners_____________________________________________________________________________________________