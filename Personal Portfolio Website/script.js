 const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("active");

        const isOpen =
            navLinks.classList.contains("active");

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation"
                : "Open navigation"
        );

        menuToggle.textContent =
            isOpen ? "✕" : "☰";

    });


    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation"
            );

            menuToggle.textContent = "☰";

        });

    });

}

const contactForm =
    document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name")
                .value.trim();

            const email =
                document.getElementById("email")
                .value.trim();

            const message =
                document.getElementById("message")
                .value.trim();


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (name === "") {

                alert("Please enter your name.");

                return;
            }


            if (email === "") {

                alert("Please enter your email.");

                return;
            }


            if (!emailPattern.test(email)) {

                alert(
                    "Please enter a valid email address."
                );

                return;
            }


            if (message === "") {

                alert("Please enter your message.");

                return;
            }


            alert(
                `Thank you, ${name}! Your message has been submitted successfully.`
            );


            contactForm.reset();

        }
    );

}

const yearElement =
    document.getElementById("year");

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (navLinks && menuToggle) {

                navLinks.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation"
                );

                menuToggle.textContent = "☰";

            }

        }

    }
);
