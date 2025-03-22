<script>
    import "../../app.css";
  </script>
  
  <div class="navbar bg-base-300 adm-header-bg">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl" href="/admin">Admin Panel</a>
      <a class="btn btn-ghost text-xl" href="/">Back to Shop</a>
    </div>
    <div class="flex-none adm-header-txt">
        Hello, Admin!
    </div>
  </div>

  <slot />