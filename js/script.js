// Global data variables
let roomData = [];
let furnitureData = [];
let comboRoomData = [];
let recipeData = {}; // Object to hold recipe categories
let ingredientData = []; // New ingredient data

// 自動計算大小和分類的輔助函數 (房間)
const processRoomData = (data) => {
    const categories = {
        '生活': ['臥房', '寢室', '山莊', '旅店', '旅館', '宿舍', '個人房', '雙人房', '浴池', '浴室', '廁所', '洗澡間', '更衣室', '客廳'],
        '餐廚': ['廚房', '食堂', '酒吧', '用餐處', '飯廳'],
        '工房': ['工房', '打鐵舖', '釀酒所', '工作室', '研究所', '倉庫', '武器庫', '道具店', '武器店', '接待大廳', '走廊'],
        '娛樂': ['游泳池', '遊戲', '健身房', '按摩室', '音樂廳', '舞廳'],
        '戶外': ['公園', '庭園', '花園', '牧場', '小屋', '廣場'],
    };

    const assignCategory = (name) => {
        for (const category in categories) {
            if (categories[category].some(keyword => name.includes(keyword))) {
                return category;
            }
        }
        return '特殊'; // Default category
    };

    return data.map(room => {
        let totalItems = 0;
        room.items.forEach(itemStr => {
            const match = itemStr.match(/X(\d+)/);
            if (match && match[1]) {
                totalItems += parseInt(match[1], 10);
            } else {
                totalItems += 1;
            }
        });

        let size = '小型 (4-35格)';
        if (totalItems > 8) {
            size = '大型 (64-150格)';
        } else if (totalItems > 4) {
            size = '普通 (36-63格)';
        }

        return {
            ...room,
            size: size,
            category: assignCategory(room.name)
        };
    });
};

// 自動計算大小和分類的輔助函數 (家具)
const processFurnitureData = (data) => {
    return data.map(item => {
        let totalItems = 0;
        item.items.forEach(itemStr => {
            const match = itemStr.match(/X(\d+)/);
            if (match && match[1]) {
                totalItems += parseInt(match[1], 10);
            } else {
                totalItems += 1;
            }
        });

        let size = '小型';
        if (totalItems > 8) {
            size = '大型';
        } else if (totalItems > 4) {
            size = '普通';
        }

        return {
            ...item,
            size: size,
            category: '組合' // All furniture items are in the '組合' category
        };
    });
};

// 遊戲說明的注意事項
const comboRoomNote = "房間必須相鄰在隔壁才有組合房間。組合完成有特別的音樂可以聽，地圖上也會有圖案可看。";

// 自動計算大小和分類的輔助函數 (組合房間)
const processComboRoomData = (data, note) => {
    return data.map(item => {
        const totalItems = item.items.length; // Number of rooms required
        return {
            ...item,
            size: `${totalItems}房組合`, // e.g., "2房組合"
            category: '組合房間',
            note: note // Add the special note
        };
    });
};

// Load data from JSON files
const loadData = async () => {
    try {
        const [rooms, furniture, comboRooms, recipes, ingredients] = await Promise.all([
            fetch('data/rooms.json').then(res => res.json()),
            fetch('data/furniture.json').then(res => res.json()),
            fetch('data/combo_rooms.json').then(res => res.json()),
            fetch('data/recipes.json').then(res => res.json()),
            fetch('data/ingredients.json').then(res => res.json())
        ]);

        roomData = processRoomData(rooms);
        furnitureData = processFurnitureData(furniture);
        comboRoomData = processComboRoomData(comboRooms, comboRoomNote);
        recipeData = recipes;
        ingredientData = ingredients;

        // Initial render after data is loaded
        renderItems();
        // Pre-render ingredients if needed, or just when tab is clicked
        renderIngredients();

    } catch (error) {
        console.error("Error loading data:", error);
        alert("無法讀取資料，請確認 data.json 檔案是否存在。");
    }
};

// DOM 元素
const roomList = document.getElementById('roomList');
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const filterSearchArea = document.getElementById('filterSearchArea'); // 取得搜尋/篩選區域
const noResults = document.getElementById('noResults');
const roomModal = document.getElementById('roomModal');
const modalContent = document.getElementById('modalContent');

const roomTab = document.getElementById('roomTab');
const furnitureTab = document.getElementById('furnitureTab');
const comboRoomTab = document.getElementById('comboRoomTab');
const ingredientTab = document.getElementById('ingredientTab');
const recipeTab = document.getElementById('recipeTab'); // 新增

const ingredientViewStatic = document.getElementById('ingredientViewStatic'); // 修改
const recipeView = document.getElementById('recipeView'); // 新增
const recipeTablesContainer = document.getElementById('recipeTablesContainer'); // 新增
const noRecipeResults = document.getElementById('noRecipeResults'); // 新增

let currentCategory = 'all';
let currentView = 'rooms'; // 'rooms', 'furniture', 'comboRooms', 'ingredients', 'recipes'

// 渲染卡片 (房間/家具/組合房間)
const renderItems = () => {
    const searchTerm = searchInput.value.toLowerCase();
    let dataToRender = [];

    // 確保非卡片內容隱藏
    ingredientViewStatic.classList.add('hidden');
    recipeView.classList.add('hidden');
    roomList.classList.remove('hidden');

    if (currentView === 'rooms') {
        dataToRender = roomData.filter(room => {
            const matchesCategory = currentCategory === 'all' || room.category === currentCategory;
            // 檢查房間名稱或物品清單是否包含搜尋詞
            const matchesName = room.name.toLowerCase().includes(searchTerm);
            const matchesItems = room.items.some(item => item.toLowerCase().includes(searchTerm));
            const matchesSearch = matchesName || matchesItems;
            return matchesCategory && matchesSearch;
        });
    } else if (currentView === 'furniture') {
        // currentView === 'furniture'
        dataToRender = furnitureData.filter(item => {
            const matchesName = item.name.toLowerCase().includes(searchTerm);
            const matchesItems = item.items.some(i => i.toLowerCase().includes(searchTerm));
            return matchesName || matchesItems;
        });
    } else if (currentView === 'comboRooms') {
        // currentView === 'comboRooms'
        dataToRender = comboRoomData.filter(item => {
            const matchesName = item.name.toLowerCase().includes(searchTerm);
            const matchesItems = item.items.some(i => i.toLowerCase().includes(searchTerm));
            return matchesName || matchesItems;
        });
    }

    roomList.innerHTML = ''; // 清空列表

    if (dataToRender.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        dataToRender.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer';
            // Add accessibility attributes
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `查看 ${item.name} 的詳細資訊`);

            // Add keyboard support for accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(item);
                }
            });

            const sizeLabel = (item.category === '組合房間') ? '組合需求:' : '房間大小:';
            const itemsLabel = (item.category === '組合房間') ? '所需房間:' : '所需物品:';

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-bold theme-text pr-2">${item.name}</h3>
                        <span class="flex-shrink-0 bg-pink-100 theme-text text-xs font-semibold px-2.5 py-1 rounded-full">${item.category}</span>
                    </div>
                    <p class="text-sm text-gray-500 mb-3"><span class="font-semibold">${sizeLabel}</span> ${item.size}</p>
                    <div class="text-xs font-medium text-gray-600">
                        <p class="font-semibold mb-1">${itemsLabel}</p>
                        <ul class="list-disc list-inside pl-1 space-y-1 text-gray-700">
                            ${item.items.slice(0, 4).map(i => `<li>${i.replace(/X/g, ' x ')}</li>`).join('')}
                            ${item.items.length > 4 ? '<li class="text-gray-400">...等 (點擊查看全部)</li>' : ''}
                        </ul>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(item));
            fragment.appendChild(card);
        });
        roomList.appendChild(fragment);
    }
};

// --- 新增：渲染料理表格 ---
const renderRecipes = (searchTerm) => {
    const createTableHTML = (title, headers, data, filterFn) => {
        const filteredData = data.filter(item => filterFn(item, searchTerm));
        if (filteredData.length === 0) return ''; // 如果沒有數據，不顯示表格

        const headerHTML = headers.map(h => `<th>${h}</th>`).join('');
        const bodyHTML = filteredData.map(item => {
            let itemCells = ''; // 修正：重新宣告
            item.items.forEach(i => {
                itemCells += `<td>${i}</td>`;
            });

            // 補齊空的 <td> (針對不同材料數量的表格)
            const requiredCells = headers.length - 2; // -2 for name and effect
            if (requiredCells > item.items.length) {
                for (let i = 0; i < (requiredCells - item.items.length); i++) {
                    itemCells += '<td></td>';
                }
            }
            return `<tr><td>${item.name}</td>${itemCells}<td>${item.effect}</td></tr>`;
        }).join('');

        return `
            <h3 class="recipe-table-title">${title}</h3>
            <table class="ingredient-table">
                <thead><tr>${headerHTML}</tr></thead>
                <tbody>${bodyHTML}</tbody>
            </table>
        `;
    };

    const filterLogic = (item, term) => {
        if (!term) return true; // 如果沒有搜尋詞，顯示全部
        const matchesName = item.name.toLowerCase().includes(term);
        const matchesItems = item.items.some(i => i.toLowerCase().includes(term));
        return matchesName || matchesItems;
    };

    // 處理雙欄佈局
    const leftColHTML = [
        createTableHTML('酒桶製作物', ['料理', '材料', '效果'], recipeData.barrel, filterLogic),
        createTableHTML('兩種材料', ['料理', '材料1', '材料2', '效果'], recipeData.twoItem, filterLogic)
    ].join('');

    const rightColHTML = [
        createTableHTML('一種材料', ['料理', '材料', '效果'], recipeData.oneItem, filterLogic),
        createTableHTML('三種材料', ['料理', '材料1', '材料2', '材料3', '效果'], recipeData.threeItem, filterLogic)
    ].join('');

    recipeTablesContainer.innerHTML = `<div class="flex flex-col">${leftColHTML}</div><div class="flex flex-col">${rightColHTML}</div>`;

    // 檢查是否有任何結果
    if (leftColHTML.trim() === '' && rightColHTML.trim() === '') {
        noRecipeResults.classList.remove('hidden');
    } else {
        noRecipeResults.classList.add('hidden');
    }
};

// --- 新增：渲染食材表格 ---
const renderIngredients = () => {
    if (!ingredientData || ingredientData.length === 0) return;

    const container = document.getElementById('ingredientTablesContainer');
    if (!container) return;

    // Group by category
    const grouped = {};
    const categoriesOrder = [];
    ingredientData.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
            categoriesOrder.push(item.category);
        }
        grouped[item.category].push(item);
    });

    // Split into two columns
    const mid = Math.ceil(categoriesOrder.length / 2);
    const col1Cats = categoriesOrder.slice(0, mid);
    const col2Cats = categoriesOrder.slice(mid);

    const generateTableHTML = (cats) => {
        let html = `
            <table class="ingredient-table">
                <thead>
                    <tr>
                        <th class="w-1/4">分類</th>
                        <th class="w-1/2">材料</th>
                        <th class="w-1/4">等級</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cats.forEach(cat => {
            const items = grouped[cat];
            items.forEach((item, i) => {
                html += '<tr>';
                if (i === 0) {
                    html += `<td rowspan="${items.length}" class="category-cell">${cat}</td>`;
                }
                html += `<td>${item.name}</td>`;
                html += `<td>${item.rank}</td>`;
                html += '</tr>';
            });
        });

        html += '</tbody></table>';
        return html;
    };

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
            <div>${generateTableHTML(col1Cats)}</div>
            <div>${generateTableHTML(col2Cats)}</div>
        </div>
    `;
};


// 開啟預覽視窗
const openModal = (item) => {
    const sizeLabel = (item.category === '組合房間') ? '組合需求:' : '房間大小:';
    const itemsLabel = (item.category === '組合房間') ? '所需房間：' : '所需物品清單：';
    const noteHtml = item.note ? `<div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-300 text-blue-800 text-sm rounded-r-lg shadow-sm">
                <h4 class="font-semibold mb-1 text-blue-900">組合房間須知</h4>
                <p>${item.note}</p>
            </div>` : '';

    modalContent.innerHTML = `
            <div class="p-6 relative">
            <button id="closeModalBtn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="關閉">
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <h2 class="text-2xl font-bold theme-text mb-3">${item.name}</h2>
            <div class="flex items-center gap-4 text-sm text-gray-500 my-3">
                <span class="bg-pink-100 theme-text font-medium px-3 py-1 rounded-full">${item.category}</span>
                <span class="font-medium">${sizeLabel} ${item.size}</span>
            </div>
            <div class="mt-4 bg-pink-50 border-l-4 theme-border p-4 rounded-r-lg">
                <h4 class="font-semibold mb-2">${itemsLabel}</h4>
                <ul class="list-disc list-inside text-gray-700 space-y-1">
                    ${item.items.map(i => `<li>${i.replace(/X/g, ' x ')}</li>`).join('')}
                </ul>
            </div>
            ${noteHtml}
        </div>
    `;
    roomModal.classList.remove('hidden');
    // Trap focus inside modal for accessibility
    const closeBtn = document.getElementById('closeModalBtn');
    closeBtn.focus();

    setTimeout(() => {
        roomModal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);

    closeBtn.addEventListener('click', closeModal);
};

// 關閉預覽視窗
const closeModal = () => {
    roomModal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        roomModal.classList.add('hidden');
    }, 300);
};

// 處理分類篩選
categoryFilters.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        currentCategory = e.target.dataset.category;
        renderItems(); // 使用新的通用渲染函數
    }
});

// 處理搜尋輸入
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    if (currentView === 'rooms' || currentView === 'furniture' || currentView === 'comboRooms') {
        renderItems();
    } else if (currentView === 'recipes') {
        renderRecipes(searchTerm);
    }
});

// 處理分頁切換
const updateActiveTab = (activeTab) => {
    const tabs = [roomTab, furnitureTab, comboRoomTab, ingredientTab, recipeTab];
    tabs.forEach(tab => {
        if (tab === activeTab) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        }
    });
};

roomTab.addEventListener('click', () => {
    currentView = 'rooms';
    updateActiveTab(roomTab);
    filterSearchArea.style.display = 'block';
    categoryFilters.style.display = 'flex';
    recipeView.classList.add('hidden');
    ingredientViewStatic.classList.add('hidden');
    renderItems();
});

furnitureTab.addEventListener('click', () => {
    currentView = 'furniture';
    updateActiveTab(furnitureTab);
    filterSearchArea.style.display = 'block';
    categoryFilters.style.display = 'none';
    recipeView.classList.add('hidden');
    ingredientViewStatic.classList.add('hidden');
    renderItems();
});

comboRoomTab.addEventListener('click', () => {
    currentView = 'comboRooms';
    updateActiveTab(comboRoomTab);
    filterSearchArea.style.display = 'block';
    categoryFilters.style.display = 'none';
    recipeView.classList.add('hidden');
    ingredientViewStatic.classList.add('hidden');
    renderItems();
});

ingredientTab.addEventListener('click', () => {
    currentView = 'ingredients';
    updateActiveTab(ingredientTab);
    filterSearchArea.style.display = 'none'; // 食材頁隱藏搜尋
    roomList.classList.add('hidden');
    recipeView.classList.add('hidden');
    ingredientViewStatic.classList.remove('hidden'); // 顯示靜態食材
    noResults.classList.add('hidden'); // 隱藏 "no results"
});

recipeTab.addEventListener('click', () => {
    currentView = 'recipes';
    updateActiveTab(recipeTab);
    filterSearchArea.style.display = 'block'; // 料理頁顯示搜尋
    categoryFilters.style.display = 'none'; // 隱藏房間分類
    roomList.classList.add('hidden');
    ingredientViewStatic.classList.add('hidden');
    recipeView.classList.remove('hidden'); // 顯示料理
    noResults.classList.add('hidden');
    renderRecipes(searchInput.value.toLowerCase()); // 初始渲染料理
});


// 點擊 Modal 背景關閉
roomModal.addEventListener('click', (e) => {
    if (e.target === roomModal) {
        closeModal();
    }
});

// 按下 ESC 鍵關閉
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && !roomModal.classList.contains('hidden')) {
        closeModal();
    }
});

// 初始渲染
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.filter-btn');

    const updateButtonStyles = () => {
        buttons.forEach(button => {
            if (button.dataset.category === currentCategory) {
                button.classList.add('theme-pink', 'text-white', 'font-semibold');
                button.classList.remove('bg-white', 'text-gray-600', 'theme-hover');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('theme-pink', 'text-white', 'font-semibold');
                button.classList.add('bg-white', 'text-gray-600', 'theme-hover');
                button.setAttribute('aria-pressed', 'false');
            }
        });
    }

    categoryFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            updateButtonStyles();
        }
    });

    updateButtonStyles();
    updateButtonStyles();
    loadData(); // 初始讀取資料並渲染
});
