
(function(){
  function ready(fn){
    if(document.readyState==='complete' || document.readyState==='interactive'){ setTimeout(fn,0); }
    else{ document.addEventListener('DOMContentLoaded', fn); window.addEventListener('load', fn, {once:true}); }
  }
  ready(function(){
    var overlay=document.querySelector('[data-cart-overlay]');
    var panel=document.querySelector('[data-cart-panel]');
    var list=document.querySelector('[data-cart-list]');
    var totalEl=document.querySelector('[data-cart-total]');
    var countEl=document.querySelector('.cart-count');
    var checkoutBtn=document.getElementById('btn-checkout');
    var checkoutForm=document.getElementById('checkout-form');
    var placeBtn=document.getElementById('place-order');
    var upLinks=document.querySelectorAll('[data-scroll-top]');
    var openers=document.querySelectorAll('[data-cart-open]');
    var closers=document.querySelectorAll('[data-cart-close],[data-cart-overlay]');

    // Scroll to top (desktop + iOS fallback)
    upLinks.forEach(function(a){
      function goTop(e){ e.preventDefault(); try{window.scrollTo({top:0,behavior:'smooth'});}catch(_){window.scrollTo(0,0);} }
      a.addEventListener('click', goTop, {passive:false});
      a.addEventListener('touchend', goTop, {passive:false});
    });

    // Storage helpers
    var KEY='cart_sunglasses_v2'; var cart=[];
    function fmt(n){ return new Intl.NumberFormat('uk-UA').format(n)+' грн'; }
    function total(){ return cart.reduce(function(s,i){ return s+i.price*i.qty; }, 0); }
    function save(){ try{ localStorage.setItem(KEY, JSON.stringify(cart)); } catch(e){} }
    function load(){ try{ var d=JSON.parse(localStorage.getItem(KEY)||'[]'); if(Array.isArray(d)) cart=d.map(function(x){return {name:x.name,price:+x.price||0,qty:Math.max(1,x.qty|0)};}); } catch(e){} }

    function render(){
      var cnt=cart.reduce(function(s,i){return s+i.qty;},0);
      countEl.textContent=cnt;
      totalEl.textContent=fmt(total());
      if(cart.length===0){
        list.innerHTML="<div style='padding:10px 0;color:#777'>Кошик порожній</div>";
        return;
      }
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

    function openCart(e){
      if(e){ e.preventDefault(); }
      overlay.classList.add('visible');
      panel.classList.add('open');
    }
    function closeCart(e){
      if(e){ e.preventDefault(); }
      overlay.classList.remove('visible');
      panel.classList.remove('open');
    }

    openers.forEach(function(btn){
      btn.addEventListener('click', openCart, {passive:false});
      btn.addEventListener('touchend', openCart, {passive:false});
    });
    closers.forEach(function(btn){
      btn.addEventListener('click', closeCart, {passive:false});
      btn.addEventListener('touchend', closeCart, {passive:false});
    });

    // Add to cart buttons (desktop + mobile)
    function bindOrderButtons(){
      Array.prototype.forEach.call(document.querySelectorAll('.order-btn'), function(btn){
        function add(ev){
          ev.preventDefault(); ev.stopPropagation();
          var name=btn.getAttribute('data-name')||'Модель';
          var price=parseInt(btn.getAttribute('data-price'),10)||0;
          var f=cart.find(function(x){return x.name===name;});
          if(f){ f.qty++; } else { cart.push({name:name,price:price,qty:1}); }
          save(); render();
        }
        btn.addEventListener('click', add, {passive:false});
        btn.addEventListener('touchend', add, {passive:false});
      });
    }

    // Qty/remove handlers
    list.addEventListener('click', function(e){
      var row=e.target.closest('.cart-item'); if(!row) return;
      var idx=parseInt(row.getAttribute('data-idx'),10);
      if(isNaN(idx) || idx<0 || idx>=cart.length) return;
      if(e.target.classList.contains('qty-plus')){
        cart[idx].qty++;
      }else if(e.target.classList.contains('qty-minus')){
        if(cart[idx].qty>1) cart[idx].qty--; else cart.splice(idx,1);
      }else if(e.target.classList.contains('remove-btn')){
        cart.splice(idx,1);
      }else{
        return;
      }
      save(); render();
    });

    // Checkout toggle
    checkoutBtn.addEventListener('click', function(){
      checkoutForm.classList.toggle('show');
    });

    // Delivery toggle
    checkoutForm.addEventListener('change', function(e){
      if(e.target.name==='delivery'){
        var showNP = e.target.value==='nova_poshta';
        document.getElementById('np-row').style.display = showNP ? 'grid' : 'none';
      }
    });

    // Place order via Telegram deep-link (fallback mailto)
    function placeOrder(){
      if(cart.length===0){ alert('Кошик порожній'); return; }
      var delivery = (checkoutForm.querySelector('input[name=\"delivery\"]:checked')||{}).value || 'nova_poshta';
      var name = document.getElementById('cust-name').value.trim();
      var phone = document.getElementById('cust-phone').value.trim();
      var comment = document.getElementById('cust-comment').value.trim();
      var city = document.getElementById('np-city').value.trim();
      var branch = document.getElementById('np-branch').value.trim();

      if(!name || !phone){ alert('Заповніть ім’я та телефон'); return; }
      if(delivery==='nova_poshta' && (!city || !branch)){ alert('Вкажіть місто та відділення Нової Пошти'); return; }

      function fmtN(n){ return new Intl.NumberFormat('uk-UA').format(n)+' грн'; }
      var lines = cart.map(function(i){ return i.name+' ×'+i.qty+' — '+fmtN(i.price*i.qty); }).join('%0A');
      var totalStr = fmtN(total());
      var deliveryStr = delivery==='nova_poshta' ? ('Нова Пошта: '+city+', відділення '+branch) : 'Самовивіз (м. Київ, вул. Михайла Максимовича, 32б)';
      var text = (
        'Нове замовлення%0A%0A'
        +'Товари:%0A'+lines+'%0A%0A'
        +'Разом: '+totalStr+'%0A'
        +deliveryStr+'%0A'
        +'Ім’я: '+encodeURIComponent(name)+'%0A'
        +'Телефон: '+encodeURIComponent(phone)+'%0A'
        +(comment?('Коментар: '+encodeURIComponent(comment)+'%0A'):'')
      );

      var tg = 'https://t.me/sunglassesbrand?text='+text;
      var win = window.open(tg, '_blank');
      if(!win){ // fallback mailto
        var mail = 'mailto:info@sunglassesbrand.ua?subject='
          +encodeURIComponent('Нове замовлення')
          +'&body='+text;
        window.location.href = mail;
      }
      cart=[]; save(); render();
      alert('Дякуємо! Замовлення відправлено.');
      closeCart();
    }
    placeBtn.addEventListener('click', function(e){ e.preventDefault(); placeOrder(); });
    placeBtn.addEventListener('touchend', function(e){ e.preventDefault(); placeOrder(); });

    // init
    load(); render(); bindOrderButtons();
  });
})();
