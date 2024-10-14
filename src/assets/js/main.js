(function ($) {
  "use strict";

  // Preloader Js
  $(window).on("load", function () {
    $(".preloader").fadeOut();
  });

  // Header Sticky Js
  $(window).on("scroll", function () {
    if ($(window).scrollTop() >= 300) {
      $(".header").addClass("fixed-header");
    } else {
      $(".header").removeClass("fixed-header");
    }
    if ($(window).scrollTop() >= 300) {
      $(".header-two").addClass("fixed-header");
    } else {
      $(".header-two").removeClass("fixed-header");
    }
  });

  // Scroll To Top Icon
  var btn = $(".scroll-top");
  $(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
      btn.addClass("show");
    } else {
      btn.removeClass("show");
    }
  });
  btn.on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "300");
  });

  //Create Background Image
  (function background() {
    let img = $(".bg-img");
    img.css("background-image", function () {
      var bg = "url(" + $(this).data("background") + ")";
      return bg;
    });
  })();
})(jQuery);

const apiURL = "https://gutendex.com/books";
let books = [];
let currentPage = 1;
const booksPerPage = 8;
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let cachedBooks = {};

// DOM Elements
const booksContainer = document.getElementById("books-container");
const searchInput = document.getElementById("search-bar");
const genreFilter = document.getElementById("genre-filter");
const currentPageDisplay = document.getElementById("current-page");
const loadingSpinner = document.getElementById("loading-spinner");
const wishlistContainer = document.getElementById("wishlist-container");

// Show loading spinner
function showLoading() {
  loadingSpinner.style.display = "block";
}

// Hide loading spinner
function hideLoading() {
  loadingSpinner.style.display = "none";
}

// Fetch and display books with caching
async function fetchBooks(page = 1) {
  if (cachedBooks[page]) {
    books = cachedBooks[page];
    displayBooks(currentPage);
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${apiURL}?page=${page}`);
    const data = await response.json();
    books = data.results;
    cachedBooks[page] = books;
    displayBooks(currentPage);
    hideLoading();
  } catch (error) {
    console.error("Error fetching books:", error);
    hideLoading();
  }
}

// Display books based on pagination
function displayBooks(page) {
  booksContainer.innerHTML = "";
  const startIndex = (page - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToDisplay = books.slice(startIndex, endIndex);

  booksToDisplay.forEach((book) => {
    const truncatedTitle =
      book.title.length > 5 ? book.title.substring(0, 5) + "..." : book.title;

    const bookHTML = `
      <div class="col-xl-3 col-lg-4 col-md-6 col-12">
      <div class="card">
        <img src="${book.formats["image/jpeg"] || "default.jpg"}" alt="${
      book.title
    }">
        <h5>${book.title}</h5>
        <p>Author: ${book.authors.map((author) => author.name).join(", ")}</p>
        <button onclick="addToWishlist(${book.id})">
          ${wishlist.includes(book.id) ? "❤️" : "♡"}
        </button>
      </div>
     </div>
    `;
    booksContainer.innerHTML += bookHTML;
  });

  currentPageDisplay.textContent = page;
}

// Search books by title (fix)
searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm)
  );
  displayFilteredBooks(filteredBooks);
});

// Display filtered books
function displayFilteredBooks(filteredBooks) {
  booksContainer.innerHTML = "";

  filteredBooks.forEach((book) => {
    const truncatedTitle =
      book.title.length > 5 ? book.title.substring(0, 5) + "..." : book.title;

    const bookHTML = `
       <div class="col-xl-3 col-lg-4 col-md-6 col-12">
      <div class="card">
        <img src="${book.formats["image/jpeg"] || "default.jpg"}" alt="${
      book.title
    }">
        <h5>${book.title}</h5>
        <p>Author: ${book.authors.map((author) => author.name).join(", ")}</p>
        <button onclick="addToWishlist(${book.id})">
          ${wishlist.includes(book.id) ? "❤️" : "♡"}
        </button>
      </div>
     </div>
    `;
    booksContainer.innerHTML += bookHTML;
  });
}

// Wishlist functionality
function addToWishlist(bookId) {
  if (!wishlist.includes(bookId)) {
    wishlist.push(bookId);
  } else {
    wishlist = wishlist.filter((id) => id !== bookId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayBooks(currentPage);
}

// Pagination functionality
document.getElementById("next-page").addEventListener("click", () => {
  if (
    currentPage * booksPerPage < books.length ||
    cachedBooks[currentPage + 1]
  ) {
    currentPage++;
    displayBooks(currentPage);
  } else {
    currentPage++;
    fetchBooks(currentPage);
  }
});

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayBooks(currentPage);
  }
});

// Fetch wishlist books
async function fetchWishlistBooks() {
  wishlistContainer.innerHTML = "";

  for (const bookId of wishlist) {
    try {
      const response = await fetch(`${apiURL}/${bookId}`);
      const book = await response.json();

      const bookHTML = `
        <div class="col-xl-3 col-lg-4 col-md-6 col-12">
          <div class="card">
            <img src="${book.formats["image/jpeg"] || "default.jpg"}" alt="${
        book.title
      }">
            <h5>${book.title}</h5>
            <p>Author: ${book.authors
              .map((author) => author.name)
              .join(", ")}</p>
            <button onclick="removeFromWishlist(${book.id})">❤️ Remove</button>
          </div>
        </div>
      `;
      wishlistContainer.innerHTML += bookHTML;
    } catch (error) {
      console.error(`Error fetching book with ID ${bookId}:`, error);
    }
  }
}

// Remove book from wishlist
function removeFromWishlist(bookId) {
  wishlist = wishlist.filter((id) => id !== bookId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  fetchWishlistBooks();
}

// Initial calls
fetchBooks(currentPage);
fetchWishlistBooks();
