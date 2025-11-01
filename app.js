(function(){
  function ready(fn){
    if(document.readyState==='complete' || document.readyState==='interactive'){ setTimeout(fn,0); }
    else{ document.addEventListener('DOMContentLoaded', fn); window.addEventListener('load', fn, {once:true}); }
  }
  ready(function(){
    console.log('[v25] app.js connected');
    var overlay=document.querySelector('.cart-overlay');
    var panel=document.querySelector('.cart-panel');
    var list=document.querySelector('.cart-list');
    var totalEl=document.querySelector('.total .sum');
    var countEl=document.querySelector('.cart-count');
    var closeX=document.getElementById('cart-close');
    var openers=[document.querySelector('.cart-btn'), document.getElementById('open-cart-hero')].filter(Boolean);

    var KEY='cart_v25'; var cart=[];
    function fmt(n){return new Intl.NumberFormat('uk-UA').format(n)+' грн';}
    function total(){return cart.reduce(function(s,i){return s+i.price*i.qty;},0);}
    function save(){try{localStorage.setItem(KEY, JSON.stringify(cart));}catch(e){console.warn('save error',e);}}
    function load(){try{var d=JSON.parse(localStorage.getItem(KEY)||'[]'); if(Array.isArray(d)) cart=d.map(function(x){return {name:x.name,price:+x.price||0,qty:Math.max(1,x.qty|0)};});}catch(e){}}

    function render(){
      countEl.textContent=cart.reduce(function(s,i){return s+i.qty;},0);
      totalEl.textContent=fmt(total());
      if(cart.length===0){ list.innerHTML="<div class='muted' style='padding:10px 0'>Кошик порожній</div>"; return; }
      list.innerHTML=cart.map(function(it,idx){
        return "<div class='cart-item' data-idx='"+idx+"'>"
            +"<span>"+it.name.toUpperCase()+"<div class='price'>"+fmt(it.price)+" / од.</div></span>"
            +"<span style='display:flex;align-items:center;gap:10px'>"
              +"<span class='line-total'>"+fmt(it.price*it.qty)+"</span>"
              +"<span class='qty'>"
                +"<button class='qty-minus' aria-label='Мінус'>−</button>"
                +"<span>×"+it.qty+"</span>"
                +"<button class='qty-plus' aria-label='Плюс'>+</button>"
              +"</span>"
              +"<button class='remove-btn' aria-label='Видалити' title='Видалити'>&times;</button>"
            +"</span>"
          +"</div>";
      }).join("");
    }
    function openCart(){ overlay.classList.add('visible'); panel.classList.add('open'); }
    function closeCart(){ overlay.classList.remove('visible'); panel.classList.remove('open'); }

    overlay.addEventListener('click', closeCart);
    if(closeX) closeX.addEventListener('click', function(e){e.preventDefault(); closeCart();});

    openers.forEach(function(btn){ function on(ev){ev.preventDefault(); openCart();}
      btn.addEventListener('click', on, {passive:false}); btn.addEventListener('touchend', on, {passive:false});
    });

    function bindOrderButtons(){
      Array.prototype.forEach.call(document.querySelectorAll('.order-btn'), function(btn){
        function add(ev){ ev.preventDefault(); ev.stopPropagation();
          var name=btn.getAttribute('data-name'); var price=parseInt(btn.getAttribute('data-price'),10)||0;
          var f=cart.find(function(x){return x.name===name;}); if(f) f.qty++; else cart.push({name:name,price:price,qty:1});
          save(); render();
        }
        btn.addEventListener('click', add, {passive:false});
        btn.addEventListener('touchend', add, {passive:false});
      });
    }

    list.addEventListener('click', function(e){
      var row=e.target.closest('.cart-item'); if(!row) return;
      var idx=parseInt(row.getAttribute('data-idx'),10);
      if(e.target.classList.contains('qty-plus')){ cart[idx].qty++; save(); render(); }
      else if(e.target.classList.contains('qty-minus')){ if(cart[idx].qty>1){ cart[idx].qty--; } else { cart.splice(idx,1); } save(); render(); }
      else if(e.target.classList.contains('remove-btn')){ cart.splice(idx,1); save(); render(); }
    });

    load(); render(); bindOrderButtons();
  });
})();