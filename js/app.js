
document.addEventListener("DOMContentLoaded", async () => {
  console.log("APP.JS ĐÃ CHẠY");

  const categoryNav = document.getElementById("categoryNav");
  const categoryTitle = document.getElementById("categoryTitle");
  const featuredSection = document.getElementById("featuredSection");
  const postList = document.getElementById("postList");

  if (!categoryNav || !categoryTitle || !featuredSection || !postList) {
    console.error("Không tìm thấy phần tử HTML cần thiết.");
    return;
  }

  let categories = [];
  let posts = [];
  let currentCategory = "";

  // Tải dữ liệu từ các file JSON
  async function loadData() {
    try {
      const [categoryResponse, postResponse] = await Promise.all([
        fetch("./data/categories.json"),
        fetch("./data/posts.json")
      ]);

      if (!categoryResponse.ok) {
        throw new Error("Không tải được data/categories.json");
      }

      if (!postResponse.ok) {
        throw new Error("Không tải được data/posts.json");
      }

      const categoryData = await categoryResponse.json();

      if (Array.isArray(categoryData)) {
        categories = categoryData;
      } else {
        categories =
          categoryData.categories ||
          categoryData.menu ||
          [];
      }

      posts = await postResponse.json();

      if (!Array.isArray(posts)) {
        throw new Error("posts.json phải chứa một mảng bài viết.");
      }

      // Đọc thêm bài viết đã lưu trong LocalStorage nếu có
      try {
        const savedPosts = JSON.parse(
          localStorage.getItem("posts") || "[]"
        );

        if (Array.isArray(savedPosts)) {
          savedPosts.forEach(savedPost => {
            const exists = posts.some(
              post => post.id === savedPost.id
            );

            if (!exists && savedPost.title) {
              posts.push(savedPost);
            }
          });
        }
      } catch (storageError) {
        console.warn("Không đọc được bài viết đã lưu:", storageError);
      }

      console.log("Đã tải danh mục:", categories.length);
      console.log("Đã tải bài viết:", posts.length);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);

      featuredSection.textContent =
        "Không tải được dữ liệu. Hãy kiểm tra các file JSON.";

      postList.textContent =
        "Mở Console trong trình duyệt để xem lỗi.";

      throw error;
    }
  }

  // Lấy tên danh mục
  function getCategoryName(category) {
    if (typeof category === "string") {
      return category;
    }

    return category?.name || category?.title || "";
  }

  // Tạo ảnh đại diện
  function createPostImage(post, featured = false) {
    const image = document.createElement("img");

    image.className = featured
      ? "post-image featured-image"
      : "post-image";

    image.alt = post.title || "Ảnh bài viết";
    image.loading = "lazy";

    image.src =
      post.image ||
      "https://placehold.co/800x450?text=Tin+tuc";

    image.onerror = () => {
      image.onerror = null;
      image.src = "https://placehold.co/800x450?text=Tin+tuc";
    };

    return image;
  }

  // Tạo thẻ bài viết
  function createPostCard(post, featured = false) {
    const article = document.createElement("article");

    article.className = featured
      ? "post-card featured-card"
      : "post-card";

    article.appendChild(createPostImage(post, featured));

    const title = document.createElement("h2");
    const titleLink = document.createElement("a");

    titleLink.href = "#";
    titleLink.textContent = post.title || "Chưa có tiêu đề";

    titleLink.addEventListener("click", event => {
      event.preventDefault();
      showPostDetail(post);
    });

    title.appendChild(titleLink);

    const excerpt = document.createElement("p");
    excerpt.className = "post-excerpt";
    excerpt.textContent = post.excerpt || "";

    const meta = document.createElement("p");
    meta.className = "post-meta";

    meta.textContent = [
      post.category || "",
      post.publishedAt || "",
      post.author || ""
    ].filter(Boolean).join(" · ");

    article.append(title, excerpt, meta);

    return article;
  }

  // Hiển thị chi tiết bài viết
  function showPostDetail(post) {
    featuredSection.replaceChildren();
    postList.replaceChildren();

    const article = document.createElement("article");
    article.className = "post-detail";

    if (post.image) {
      article.appendChild(createPostImage(post, true));
    }

    const title = document.createElement("h2");
    title.textContent = post.title || "Chưa có tiêu đề";

    const meta = document.createElement("p");
    meta.className = "post-meta";
    meta.textContent = [
      post.author || "",
      post.publishedAt || "",
      post.category || ""
    ].filter(Boolean).join(" · ");

    const content = document.createElement("div");
    content.className = "post-content";

    // Hiển thị nội dung dưới dạng văn bản an toàn
    (post.content || post.excerpt || "")
      .split("\n")
      .forEach(paragraphText => {
        if (!paragraphText.trim()) return;

        const paragraph = document.createElement("p");
        paragraph.textContent = paragraphText;
        content.appendChild(paragraph);
      });

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "back-button";
    backButton.textContent = "← Quay lại danh sách";

    backButton.addEventListener("click", () => {
      renderPosts(currentCategory);
    });

    article.append(title, meta, content, backButton);
    featuredSection.appendChild(article);

    categoryTitle.textContent = "Chi tiết bài viết";

    document.querySelector(".page-heading")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  // Hiển thị danh sách bài viết
  function renderPosts(categoryName = "") {
    currentCategory = categoryName;

    categoryTitle.textContent =
      categoryName || "Tin tức mới nhất";

    featuredSection.replaceChildren();
    postList.replaceChildren();

    const filteredPosts = posts
      .filter(post => {
        if (!categoryName) return true;

        if (Array.isArray(post.category)) {
          return post.category.includes(categoryName);
        }

        return post.category === categoryName;
      })
      .sort((a, b) => {
        return (
          new Date(b.publishedAt || 0) -
          new Date(a.publishedAt || 0)
        );
      });

    if (filteredPosts.length === 0) {
      featuredSection.textContent =
        "Chưa có bài viết trong chuyên mục này.";

      postList.textContent =
        "Hãy thêm bài viết vào data/posts.json.";

      return;
    }

    // Ba bài mới nhất ở phần nổi bật
    filteredPosts.slice(0, 3).forEach((post, index) => {
      featuredSection.appendChild(
        createPostCard(post, index === 0)
      );
    });

    // Những bài còn lại ở danh sách phía dưới
    const remainingPosts = filteredPosts.slice(3);

    if (remainingPosts.length === 0) {
      const message = document.createElement("p");
      message.textContent =
        "Đây là các bài viết hiện có. Hãy bổ sung thêm bài để danh sách đầy đủ hơn.";

      postList.appendChild(message);
    } else {
      remainingPosts.forEach(post => {
        postList.appendChild(createPostCard(post));
      });
    }
  }

  // Hiển thị thanh danh mục
  function renderCategories() {
    categoryNav.replaceChildren();

    const homeLink = document.createElement("a");
    homeLink.href = "#";
    homeLink.className = "nav-link";
    homeLink.textContent = "Trang chủ";

    homeLink.addEventListener("click", event => {
      event.preventDefault();
      renderPosts();
    });

    categoryNav.appendChild(homeLink);

    categories.forEach(category => {
      const name = getCategoryName(category);

      if (!name) return;

      const link = document.createElement("a");
      link.href = "#";
      link.className = "nav-link";
      link.textContent = name;

      link.addEventListener("click", event => {
        event.preventDefault();
        renderPosts(name);
      });

      categoryNav.appendChild(link);
    });
  }

  // Khởi động website
  try {
    await loadData();
    renderCategories();
    renderPosts();
  } catch (error) {
    console.error("Không thể khởi động website:", error);
  }
});
``