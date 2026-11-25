// Portfolio interactions: header state, mobile menu, stock ledger demo, contact form.
(function () {
    "use strict";

    /* ---------- Header border once the page scrolls ---------- */
    var header = document.querySelector(".site-header");
    function onScroll() {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile menu ---------- */
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    var toggleLabel = toggle.querySelector(".menu-toggle-label");

    function setMenu(open) {
        toggle.setAttribute("aria-expanded", String(open));
        nav.classList.toggle("is-open", open);
        toggleLabel.textContent = open ? "Close" : "Menu";
    }
    toggle.addEventListener("click", function () {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setMenu(false);
            toggle.focus();
        }
    });

    /* ---------- Stock ledger demo ----------
       Same idea as the real KLIG system: stock is never stored,
       it is the sum of IN movements minus the sum of OUT movements. */
    var rowsEl = document.getElementById("ledger-rows");
    var totalEl = document.getElementById("ledger-total");

    var startingMoves = [
        { type: "in", doc: "Goods receipt", qty: 24 },
        { type: "out", doc: "Invoice", qty: 4 },
        { type: "out", doc: "Shop sale", qty: 1 }
    ];
    var moves = startingMoves.slice();
    var receiptNo = 2;
    var saleNo = 2;

    function stockOnHand() {
        return moves.reduce(function (sum, m) {
            return m.type === "in" ? sum + m.qty : sum - m.qty;
        }, 0);
    }

    function render(highlightNewest) {
        rowsEl.innerHTML = "";
        for (var i = moves.length - 1; i >= 0; i--) {
            var m = moves[i];
            var tr = document.createElement("tr");
            if (highlightNewest && i === moves.length - 1) tr.className = "is-new";
            tr.innerHTML =
                '<td><span class="move move-' + m.type + '">' + m.type.toUpperCase() + "</span></td>" +
                "<td>" + m.doc + "</td>" +
                '<td class="num">' + (m.type === "in" ? "+" : "−") + m.qty + "</td>";
            rowsEl.appendChild(tr);
        }
        totalEl.textContent = stockOnHand();
        if (highlightNewest) {
            totalEl.classList.remove("is-bumped");
            void totalEl.offsetWidth; // restart the animation
            totalEl.classList.add("is-bumped");
        }
    }

    document.querySelector(".ledger-actions").addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-move]");
        if (!btn) return;
        var action = btn.getAttribute("data-move");

        if (action === "in") {
            moves.push({ type: "in", doc: "Goods receipt #" + receiptNo++, qty: 10 });
        } else if (action === "out") {
            if (stockOnHand() < 2) {
                totalEl.textContent = stockOnHand();
                btn.textContent = "Not enough stock";
                setTimeout(function () { btn.textContent = "Sell 2"; }, 1400);
                return;
            }
            moves.push({ type: "out", doc: "Shop sale #" + saleNo++, qty: 2 });
        } else {
            moves = startingMoves.slice();
            receiptNo = 2;
            saleNo = 2;
            render(false);
            return;
        }
        render(true);
    });

    render(false);

    /* ---------- Contact form: opens the visitor's email app ---------- */
    var form = document.getElementById("contact-form");
    var errorEl = document.getElementById("form-error");
    var TO = "ivosardzovski@hotmail.com";

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fields = form.querySelectorAll("input, textarea");
        var firstInvalid = null;

        fields.forEach(function (f) {
            var ok = f.checkValidity();
            f.setAttribute("aria-invalid", ok ? "false" : "true");
            if (!ok && !firstInvalid) firstInvalid = f;
        });

        if (firstInvalid) {
            var label = form.querySelector('label[for="' + firstInvalid.id + '"]').textContent;
            errorEl.textContent = firstInvalid.type === "email" && firstInvalid.value
                ? "Enter a valid email address, like name@example.com."
                : "Fill in “" + label + "” to send your message.";
            errorEl.hidden = false;
            firstInvalid.focus();
            return;
        }
        errorEl.hidden = true;

        var el = form.elements;
        var name = el.namedItem("name").value.trim();
        var email = el.namedItem("email").value.trim();
        var subject = el.namedItem("subject").value.trim() || "Message from your portfolio";
        var body = el.namedItem("message").value.trim() + "\n\n" + name + "\n" + email;

        window.location.href = "mailto:" + TO +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);
    });

    form.addEventListener("input", function (e) {
        if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity()) {
            e.target.setAttribute("aria-invalid", "false");
        }
    });

    /* ---------- Footer year ---------- */
    document.getElementById("year").textContent = new Date().getFullYear();
})();
