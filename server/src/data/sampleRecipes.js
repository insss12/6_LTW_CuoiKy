
const recipes = [
  {
    id: "mau-1",
    title: "Thịt kho trứng",
    description: "Thịt ba chỉ kho mềm cùng trứng, nước màu đậm đà, ăn với cơm trắng rất hao cơm.",
    category: "Món chính",
    image: "https://www.knuspr.de/cdn-cgi/image/f%3Dauto%2Cfit%3Dcover%2Cg%3D0.5x0.5%2Cw%3D900%2Ch%3D900/https%3A/cdn.knuspr.de/images/meals/small/recipe_1022_1775597052893_thit-kho-tau-karamellisierter-schweinebauch_1614879e.png",
    views: 0,
    emoji: "🍖",
    prepTime: 15,
    cookingTime: 60,
    time: 75,
    difficulty: "Dễ",
    servings: 4,
    ingredients: [
      { name: "Thịt ba chỉ", quantity: "500", unit: "gram" },
      { name: "Trứng", quantity: "6", unit: "quả" },
      { name: "Nước dừa", quantity: "400", unit: "ml" },
      { name: "Hành tím", quantity: "3", unit: "củ" },
      { name: "Nước mắm", quantity: "3", unit: "muỗng canh" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Luộc trứng, bóc vỏ. Thịt ba chỉ cắt miếng vuông, ướp hành tím, nước mắm và đường 20 phút." },
      { stepNumber: 2, instruction: "Thắng đường làm nước màu, cho thịt vào đảo đến khi săn lại." },
      { stepNumber: 3, instruction: "Đổ nước dừa vào, cho trứng vào cùng, đun nhỏ lửa khoảng 45 phút đến khi nước sánh." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z"
  },

  {
    id: "mau-2",
    title: "Phở gà",
    description: "Nước dùng trong, ngọt thanh từ xương gà, ăn kèm hành lá, chanh và ớt.",
    category: "Món nước",
    image: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/chicken_pho.jpg",
    views: 0,
    emoji: "🍜",
    prepTime: 20,
    cookingTime: 90,
    time: 110,
    difficulty: "Trung bình",
    servings: 4,
    ingredients: [
      { name: "Gà ta", quantity: "1", unit: "con" },
      { name: "Bánh phở", quantity: "500", unit: "gram" },
      { name: "Gừng", quantity: "1", unit: "củ" },
      { name: "Hành tây", quantity: "2", unit: "củ" },
      { name: "Hành lá", quantity: "3", unit: "cây" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Làm sạch gà, luộc với gừng và hành tây nướng khoảng 40 phút, vớt gà ra ngâm nước đá." },
      { stepNumber: 2, instruction: "Tiếp tục ninh nước dùng thêm 30 phút, nêm muối và nước mắm cho vừa ăn." },
      { stepNumber: 3, instruction: "Chần bánh phở, xếp thịt gà xé, chan nước dùng nóng và rắc hành lá." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-02T00:00:00.000Z"
  },

  {
    id: "mau-3",
    title: "Đậu hũ sốt cà chua",
    description: "Món chay đơn giản, đậu hũ chiên vàng om cùng sốt cà chua chua ngọt.",
    category: "Món chay",
    image: "https://images.squarespace-cdn.com/content/v1/5fee116050339566e9b38f09/1622384255493-RBTE3V6R5AI8DDVRS9AP/Whiskey-and-booch-tofu-and-tomato-72.jpg",
    views: 0,
    emoji: "🍅",
    prepTime: 10,
    cookingTime: 20,
    time: 30,
    difficulty: "Dễ",
    servings: 3,
    ingredients: [
      { name: "Đậu hũ", quantity: "4", unit: "bìa" },
      { name: "Cà chua", quantity: "4", unit: "quả" },
      { name: "Hành lá", quantity: "2", unit: "cây" },
      { name: "Nước tương", quantity: "1", unit: "muỗng canh" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Cắt đậu hũ thành miếng vừa ăn, chiên vàng các mặt." },
      { stepNumber: 2, instruction: "Xào cà chua băm nhuyễn với chút dầu đến khi mềm, nêm nước tương và đường." },
      { stepNumber: 3, instruction: "Cho đậu hũ vào om 5 phút, rắc hành lá rồi tắt bếp." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-03T00:00:00.000Z"
  },

  {
    id: "mau-4",
    title: "Bánh mì trứng ốp la",
    description: "Bữa sáng nhanh gọn với bánh mì giòn, trứng ốp la lòng đào và chút rau thơm.",
    category: "Ăn sáng",
    image: "https://images2.thanhnien.vn/528068263637045248/2025/12/12/banh-mi-trung-1765551266247491111643.jpg",
    views: 0,
    emoji: "🥪",
    prepTime: 5,
    cookingTime: 10,
    time: 15,
    difficulty: "Dễ",
    servings: 1,
    ingredients: [
      { name: "Bánh mì", quantity: "1", unit: "ổ" },
      { name: "Trứng", quantity: "2", unit: "quả" },
      { name: "Dưa leo", quantity: "1/2", unit: "quả" },
      { name: "Bơ", quantity: "1", unit: "muỗng cà phê" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Nướng bánh mì cho giòn, phết một lớp bơ mỏng." },
      { stepNumber: 2, instruction: "Làm nóng chảo, chiên trứng ốp la đến khi lòng trắng chín." },
      { stepNumber: 3, instruction: "Kẹp trứng và dưa leo vào bánh mì, nêm chút muối tiêu." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-04T00:00:00.000Z"
  },

  {
    id: "mau-5",
    title: "Gỏi cuốn tôm thịt",
    description: "Món khai vị thanh mát với tôm, thịt luộc, bún và rau sống cuốn trong bánh tráng.",
    category: "Món khai vị",
    image: "https://i0.wp.com/vickypham.com/wp-content/uploads/2024/08/f67fd-img_9264.jpg?fit=2500%2C2500&ssl=1",
    views: 0,
    emoji: "🥬",
    prepTime: 25,
    cookingTime: 15,
    time: 40,
    difficulty: "Trung bình",
    servings: 4,
    ingredients: [
      { name: "Tôm", quantity: "300", unit: "gram" },
      { name: "Thịt ba chỉ", quantity: "200", unit: "gram" },
      { name: "Bánh tráng", quantity: "15", unit: "tờ" },
      { name: "Bún tươi", quantity: "200", unit: "gram" },
      { name: "Rau xà lách", quantity: "1", unit: "cây" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Luộc tôm và thịt, tôm bóc vỏ bổ đôi, thịt thái lát mỏng." },
      { stepNumber: 2, instruction: "Nhúng bánh tráng qua nước, xếp rau, bún, thịt rồi cuốn chặt tay." },
      { stepNumber: 3, instruction: "Dùng kèm nước chấm tương đậu phộng hoặc mắm nêm." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-05T00:00:00.000Z"
  },

  {
    id: "mau-6",
    title: "Chè đậu xanh",
    description: "Chè đậu xanh nấu nhuyễn, thơm mùi lá dứa, ăn nóng hoặc lạnh đều ngon.",
    category: "Tráng miệng",
    image: "https://bookvietnamholiday.com/assets/img/vietnamese-cuisine/che/che-dau-xanh-hanoi.jpg",
    views: 0,
    emoji: "🍮",
    prepTime: 10,
    cookingTime: 40,
    time: 50,
    difficulty: "Dễ",
    servings: 4,
    ingredients: [
      { name: "Đậu xanh", quantity: "200", unit: "gram" },
      { name: "Đường", quantity: "100", unit: "gram" },
      { name: "Lá dứa", quantity: "3", unit: "lá" },
      { name: "Nước cốt dừa", quantity: "100", unit: "ml" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Ngâm đậu xanh 2 giờ, vo sạch rồi cho vào nồi cùng lá dứa." },
      { stepNumber: 2, instruction: "Nấu nhỏ lửa khoảng 30 phút đến khi đậu nhuyễn, thêm đường khuấy tan." },
      { stepNumber: 3, instruction: "Múc ra chén, rưới nước cốt dừa lên trên." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-06T00:00:00.000Z"
  },

  {
    id: "mau-7",
    title: "Canh chua cá lóc",
    description: "Canh chua miền Tây với cá lóc, me, dọc mùng, cà chua và thơm.",
    category: "Món nước",
    image: "https://bookvietnamholiday.com/assets/img/vietnamese-cuisine/canh-chua/canh-chua-hero.jpg",
    views: 0,
    emoji: "🐟",
    prepTime: 20,
    cookingTime: 25,
    time: 45,
    difficulty: "Trung bình",
    servings: 4,
    ingredients: [
      { name: "Cá lóc", quantity: "1", unit: "con" },
      { name: "Me", quantity: "30", unit: "gram" },
      { name: "Cà chua", quantity: "2", unit: "quả" },
      { name: "Thơm", quantity: "1/4", unit: "quả" },
      { name: "Dọc mùng", quantity: "2", unit: "cây" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Cá làm sạch, cắt khúc, ướp chút muối và tiêu." },
      { stepNumber: 2, instruction: "Đun nước me, cho cà chua, thơm vào nấu sôi rồi thả cá vào." },
      { stepNumber: 3, instruction: "Thêm dọc mùng, nêm nếm vừa ăn, rắc rau om và ngò gai." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-07T00:00:00.000Z"
  },

  {
    id: "mau-8",
    title: "Cá kho tộ",
    description: "Cá kho trong tộ đất, nước kho sánh, thơm mùi tiêu và hành, đậm vị miền Nam.",
    category: "Món chính",
    image: "https://statics.vinpearl.com/vietnamese-fish-dishes-6_1697085630.jpg",
    views: 0,
    emoji: "🍲",
    prepTime: 15,
    cookingTime: 45,
    time: 60,
    difficulty: "Trung bình",
    servings: 4,
    ingredients: [
      { name: "Cá basa", quantity: "500", unit: "gram" },
      { name: "Nước mắm", quantity: "3", unit: "muỗng canh" },
      { name: "Đường", quantity: "2", unit: "muỗng canh" },
      { name: "Hành tím", quantity: "3", unit: "củ" },
      { name: "Tiêu", quantity: "1", unit: "muỗng cà phê" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Cá cắt khúc, ướp nước mắm, đường, hành tím và tiêu khoảng 30 phút." },
      { stepNumber: 2, instruction: "Thắng nước màu trong tộ, xếp cá vào, thêm chút nước." },
      { stepNumber: 3, instruction: "Kho nhỏ lửa đến khi nước sánh lại, rắc thêm tiêu và ớt." }
    ],
    author: "Bếp Nhà",
    rating: 0,
    reviewCount: 0,
    createdAt: "2026-01-08T00:00:00.000Z"
  }
];

export default recipes;
