
// Chuẩn hóa dữ liệu bài báo
function normalizeArticle(article) {
    return {
        id: article.id || Date.now().toString(),
        title: article.title || "",
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        author: article.author || "Chưa rõ",
        category: article.category || "Tin tức",
        publishedAt: article.publishedAt || "",
        source: article.source || "Dân trí",
        url: article.url || "",
        image: article.image || ""
    };
}

// Lưu bài báo vào LocalStorage
function saveArticle(article) {
    const normalized = normalizeArticle(article);

    let posts = [];

    try {
        const saved = localStorage.getItem("posts");
        posts = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(posts)) {
            posts = [];
        }
    } catch (error) {
        posts = [];
    }

    // Không tạo bài trùng URL
    const index = posts.findIndex(
        post => post.url && post.url === normalized.url
    );

    if (index >= 0) {
        posts[index] = normalized;
    } else {
        posts.push(normalized);
    }

    localStorage.setItem("posts", JSON.stringify(posts));

    return normalized;
}

console.log("CRAWLER.JS ĐÃ CHẠY");
``