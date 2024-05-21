function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

// Inicialize o Google One Tap
google.accounts.id.initialize({
    client_id: '435463394698-f22hdgvn8n8qatsst5pg2ss2c8de0to6.apps.googleusercontent.com',
    callback: handleCredentialResponse

});


// Manipula a resposta de credenciais
function handleCredentialResponse(response) {
    if (response.credential) {
        // As credenciais do usuário estão disponíveis em response.credential
        let credentials = parseJwt(response.credential);
        if (credentials.hd != "ufrrj.br") {
            alert("Utilize um e-mail da UFRRJ para fazer login");
            return;
        }

        // let encryptedEmail;
        // $.getJSON("/get-key", function (key) {
        //     encryptedEmail = CryptoJS.AES.encrypt(credentials.email, key.key).toString();
        // });
        $.ajax({
            url: '/add-user',
            type: 'POST',
            data: {
                email: credentials.email
                //email: encrypdetEmail
            },
            success: function (response) {
                console.log('Usuário adicionado com sucesso:', response);
            },
            error: function (error) {
                console.log('Erro ao adicionar usuário:', error);
            }
        });
        let name = credentials.given_name.charAt(0).toUpperCase() + credentials.given_name.slice(1).toLowerCase();
        localStorage.setItem("email", credentials.email);
        //localStorage.setItem("email", encryptedEmail);
        localStorage.setItem("name", name);
        localStorage.setItem("time", new Date().getTime());
        window.location.href = "/agendamento";

    } else {
        // O usuário não fez login
        console.log('O usuário não fez login.');
    }
}

// Adicione um ouvinte de eventos ao botão de login
document.getElementById('login-button').addEventListener('click', function () {
    // Solicite as credenciais do usuário
    google.accounts.id.prompt(notification => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // O usuário não visualizou ou pulou a notificação
            console.log('O usuário não visualizou ou pulou a notificação.');
        } else {
            // A notificação foi exibida e o usuário interagiu com ela
            console.log('O usuário interagiu com a notificação.');
        }
    });
});

