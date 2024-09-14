function logout() {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("time");
}

window.addEventListener('load', function () {
    let time = new Date().getTime();
    if (JSON.parse(localStorage.getItem("time")) + 1000 * 60 * 60 * 8 < time) {
        logout();
    };

    let name = localStorage.getItem("name");

    if (name != null) {
        if (window.location.pathname == "") {
            window.location.href = "agendamento";
        }

        document.getElementById("hello").innerText = `Olá ${name}!`;
        let loginLink = document.getElementById("login-link")
        loginLink.parentNode.removeChild(loginLink)
    } else {
        let logoutLink = document.getElementById("logout-link")
        logoutLink.parentNode.removeChild(logoutLink)
    }
    $.getJSON("get-users", function (data) {
        let users = data;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email == localStorage.getItem("email") && users[i].ocupacao != "Professor" || localStorage.getItem("email") == null) {
                let adminPage = document.getElementById("admin-page")
                if (adminPage) {
                    adminPage.parentNode.removeChild(adminPage);
                }

            }
        }
    });
})