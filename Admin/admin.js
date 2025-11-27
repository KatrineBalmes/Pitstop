document.getElementById("signin-btn").addEventListener("click", function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const correctUser = "owner";
    const correctPass = "PlsStopGuessing";

    // Check if fields are empty
    if (username === "" || password === "") {
        alert("Please fill out both fields.");
        return;
    }

    // Full correct login
    if (username === correctUser && password === correctPass) {
        alert("Login Successful!");
        window.location.href = "admin_interface.html"; // Redirect to dashboard
        return;
    }

    // Wrong username AND wrong password
    if (username !== correctUser && password !== correctPass) {
        alert("Invalid username and password");
        return;
    }

    // Wrong password only
    if (password !== correctPass) {
        alert("Invalid password");
        return;
    }

    // Wrong username only
    if (username !== correctUser) {
        alert("Invalid username");
        return;
    }
});
