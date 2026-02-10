document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
});

function setupMenu() {
  const openBtn = document.querySelector(".burgerbtn");
  const closeBtn = document.querySelector(".closebtn");
  const sidebar = document.querySelector("#header-bottom nav");
  const overlay = document.getElementById("overlay");
  const page = document.body;

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      sidebar.style.width = "100%";
      overlay.style.display = "block";
      closeBtn.style.display = "block";
      page.style.overflow = "hidden";
    }
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.innerWidth <= 768) {
      sidebar.style.width = "0";
      overlay.style.display = "none";
      closeBtn.style.display = "none";
      page.style.overflow = "inherit";
    }
  });

  overlay.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.style.width = "0";
      overlay.style.display = "none";
      closeBtn.style.display = "none";
    }
  });
}
