// Get all input elements
const siteTitleInput = document.getElementById("siteTitle");
const siteDescriptionInput = document.getElementById("siteDescription");
const faviconInput = document.getElementById("faviconInput");
const themeSelect = document.getElementById("themeSelect");
const toggleBreadcrumbs = document.getElementById("toggleBreadcrumbs");
const toggleSearch = document.getElementById("toggleSearch");
const shareImageUrl = document.getElementById("shareImageUrl");
const applyButton = document.getElementById("applyButton");

// Get preview elements
const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");
const faviconDisplay = document.getElementById("faviconDisplay");
const websitePreview = document.getElementById("websitePreview");
const breadcrumbs = document.getElementById("breadcrumbs");
const searchContainer = document.getElementById("searchContainer");
const previewImage = document.getElementById("previewImage");

// Function to apply customization
function applyCustomization() {
  // Update title and description
  previewTitle.textContent = siteTitleInput.value;
  previewDescription.textContent = siteDescriptionInput.value;

  // Update favicon emoji display
  faviconDisplay.textContent = faviconInput.value || "🌐";

  // Update theme
  websitePreview.classList.remove("light-theme", "dark-theme");
  if (themeSelect.value === "dark") {
    websitePreview.classList.add("dark-theme");
  } else {
    websitePreview.classList.add("light-theme");
  }

  // Toggle breadcrumbs
  breadcrumbs.style.display = toggleBreadcrumbs.checked ? "block" : "none";

  // Toggle search bar
  searchContainer.style.display = toggleSearch.checked ? "block" : "none";

  // Update share preview image
  previewImage.src = shareImageUrl.value || "https://via.placeholder.com/600x300?text=Preview+Image";

  // Optional: update browser tab title
  document.title = siteTitleInput.value;
}

// Apply when button is clicked
applyButton.addEventListener("click", applyCustomization);

// Optional: apply once on page load
applyCustomization();






