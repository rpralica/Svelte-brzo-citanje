<script>
    import Wpm from './Wpm.svelte';
</script>

<!-- Uski fiksni sidebar - desno, uvijek vidljiv -->
<div class="quick-timer-strip">
  

    <button
        class="qt-btn qt-settings ms-auto"
        type="button"
        title="Podesavanja i WpM"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight">🛠️</button
    >
</div>

<!-- Offcanvas - desno, otvara se prema lijevo (novi ID da nema konflikta sa starim kešom) -->
<div
    class="offcanvas offcanvas-end"
    data-bs-scroll="true"
    data-bs-backdrop="false"
    tabindex="-1"
    id="offcanvasRight"
    aria-labelledby="offcanvasRightLabel"
>
    <div class="offcanvas-header">
        <h5  class="offcanvas-title " id="offcanvasRightLabel">Alati</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body container">
        <Wpm></Wpm>
    </div>
</div>

<style>
    .quick-timer-strip {
        position: fixed;
        right: 0;
        top: 70px;
        bottom: 0;
        width: 78px;
        background: #f8f9fa;
        border-left: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 4px;
        gap: 16px;
        z-index: 1030;
        overflow-y: auto;
    }
    .qt-btn {
        width: 36px;
        height: 32px;
        border: 1px solid #999;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        font-size: 15px;
        line-height: 1;
    }
    .qt-btn:active {
        background: #e0e0e0;
    }
    .qt-settings {
        margin-top: auto;
        width: 40px;
        height: 40px;
        font-size: 18px;
    }

    /* Na malim ekranima - traka ide na dno */
    @media (max-width: 768px) {
        .quick-timer-strip {
        position: fixed;
        right: 0;
        top: 70px;
        bottom: 50px; /* <--- Ovdje smo je odigli od dna za 50px da pobjegne od Netlify logoa */
        width: 78px;
        background: #f8f9fa;
        border-left: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 4px;
        gap: 16px;
        z-index: 1030;
        overflow-y: auto;
    }
        .qt-settings {
            margin-top: 0;
            width: 36px;
            height: 36px;
            font-size: 16px;
        }
    }
</style>