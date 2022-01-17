const counterEl = document.getElementById('pointsCounter');
const clickerButtonEL = document.getElementById('clickerButton');
const msgWrapperEl = document.getElementById('msgWrapper');
const shopEl = document.getElementById('shop');
const saveBtn = document.querySelector('.saveBtn');

let shopItems = [
    {
        name: 'CPSBoost',
        cost: 100,
        maxCount: 30,
        amount: 0,
        onClick: function() {
            
        }
    },
    {
        name: 'Autoclicker',
        cost: 130,
        maxCount: 10,
        amount: 0,
        onClick: function() {
            
        }
    }
]

let points;

function init() {
    points = Number(getValueStandard('points', 0));
    shopItems.forEach((item) => {
        item.amount = Number(getValueStandard(`shopItem-${item.name}`, 0));
    });

    createShop();
    updateUi();
}

function createNotification(text, cclass = 'blue') {
    const msgEl = document.createElement('div');
    msgEl.classList.add('msg', cclass);
    msgEl.textContent = text;

    msgWrapperEl.appendChild(msgEl);
    setTimeout(() => msgEl.remove(), 3000);
}

function addPoints(amt) {
    points += amt;
}

function removePoints(amt) {
    points -= amt;
}

function clicked(e) {
    e.preventDefault();

    let x = e.clientX - clickerButtonEL.offsetLeft;
    let y = e.clientY - clickerButtonEL.offsetTop;
    
    let amt = shopItems[0].amount == 0 ? 1 : (shopItems[0].amount + 1) ** 2;

    spawnFloatingNumber(x, y, amt);

    addPoints(amt);
    updateUi();
}

function spawnFloatingNumber(x, y, amt) {
    let floatingNumber = document.createElement('span');
    floatingNumber.classList.add('floatingNumber');
    floatingNumber.textContent = `+${numberWithCommas(amt)}`;

    floatingNumber.style.top = `${y}px`;
    floatingNumber.style.left = `${x}px`;

    clickerButtonEL.appendChild(floatingNumber);

    setTimeout(() => floatingNumber.remove(), 1950);
}

function save() {
    if(typeof points == 'number' && points > 0) {
        setCookie('points', points, 365);
    }
    shopItems.forEach((item) => {
        if(typeof item.amount == 'number' && item.amount > 0) {
            setCookie(`shopItem-${item.name}`, item.amount, 365);
        }
    });

    createNotification('saved!');
}

function getValueStandard(value, standard) {
    value = getCookie(value);
    if(value !== '') {
        return value;
    }
    return standard;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;" + "SameSite=None; Secure";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
}

function numberWithCommas(num) {
    if(num < 1_000_000) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    const lookup = [
        { value: 1e6, symbol: " Million" },
        { value: 1e9, symbol: " Billion" },
        { value: 1e12, symbol: " Trillion" },
        { value: 1e15, symbol: " Quadrillion" },
        { value: 1e18, symbol: " Quintillion" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
    });
    return item ? (num / item.value).toFixed(3).replace(rx, "$1") + item.symbol : "0";
}

function buyItem(cost) {
    if(cost > points) {
        createNotification(`Not enough Points! (${points} of ${cost})`, 'red');
        return false;
    } else {
        removePoints(cost);

        createNotification('Purchased Item', 'blue');
        return true;
    }
}

function updateUi() {
    counterEl.textContent = numberWithCommas(points);
    shopItems.forEach((item) => {
        cost = item.amount == 0 ? item.cost : Math.round(item.cost * item.amount * 22);

        let costEl = document.getElementById(`shopItem-${item.name}-cost`);
        let amtEl = document.getElementById(`shopItem-${item.name}-amt`);

        costEl.textContent = `Cost: ${cost}`;
        amtEl.textContent = `Amount: ${item.amount}`;
    });
}

function createShop() {
    shopItems.forEach((item, idx) => {
        let cost = item.amount == 0 ? item.cost : Math.round(item.cost * (item.amount * 2) * 22);
        let shopItem = document.createElement('button');
        shopItem.id = `shopItem-${item.name}`;
        shopItem.classList.add('shopItem');
        
        let nameEl = document.createElement('div');     
        nameEl.id = `shopItem-${item.name}-name`;                           
        nameEl.textContent = item.name;
        nameEl.style.fontWeight = 'bold';
        shopItem.appendChild(nameEl);

        let costEl = document.createElement('div');
        costEl.id = `shopItem-${item.name}-cost`;
        costEl.textContent = `Cost: ${cost}`;
        shopItem.appendChild(costEl);

        let amtEl = document.createElement('div');
        amtEl.id = `shopItem-${item.name}-amt`;
        amtEl.textContent = `Amount: ${item.amount}`;
        shopItem.appendChild(amtEl);
                                        
        shopEl.appendChild(shopItem);

        shopItem.addEventListener('click', () => {
            if(item.amount + 1 > item.maxCount) {
                createNotification(`Maximum amount purchased ${item.maxCount}`);
            } else {
                let cost = item.amount == 0 ? item.cost : Math.round(item.cost * item.amount * 22);
                if(buyItem(cost)) {
                    item.onClick();
                    item.amount++;
                }
            }

            updateUi();
        });
    });
}

function autoclicker() {
    if(shopItems[1].amount > 0) {
        let amt = shopItems[0].amount == 0 ? 1 : (shopItems[0].amount + 1) ** 2;
        addPoints(amt * shopItems[1].amount);
    }
}

/* START */

init();

window.setInterval(() => {
    autoclicker();
    save();
    document.title = `${numberWithCommas(points)} Points - Random Clicker`;
    updateUi();
}, 10000);

clickerButtonEL.addEventListener('click', (e) => {
    clicked(e);
});

saveBtn.addEventListener('click', save);