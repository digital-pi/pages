async function purge() {
    const $test=document.getElementById('test_location');
    let loc=window.location.href;
    if ($test) loc=$test.value;

    const url=new URL(loc);
    let path=url.pathname;

    $spinnerWrap=document.createElement('div');
    $spinnerWrap.innerHTML=(`<style>
        .purge-spinner {
            position: fixed;
            width: 100vw;
            height: 100vh;
            background-color: #ffffffe0;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            color: black;         
        }

        .purge-spinner div {
            border-radius: 32px;
            padding: 8px 32px 15px 32px;
            color: white;
            background-color: black;
            animation: heartbeat 1.5s ease-in-out infinite both;
        }

        @keyframes heartbeat {
        from {
                    transform: scale(1);
                    transform-origin: center center;
                    animation-timing-function: ease-out;
        }
        10% {
                    transform: scale(0.91);
                    animation-timing-function: ease-in;
        }
        17% {
                    transform: scale(0.98);
                    animation-timing-function: ease-out;
        }
        33% {
                    transform: scale(0.87);
                    animation-timing-function: ease-in;
        }
        45% {
                    transform: scale(1);
                    animation-timing-function: ease-out;
        }
        }


    </style>
    <div class="purge-spinner">
        <div>Publishing</div>
    </div>`);

    document.body.appendChild($spinnerWrap);

    console.log(`purging for path: ${path}`)
    await sendPurge(path);

    if (path.endsWith('.html')) {
        path=path.slice(0, -5);
        console.log(`purging for path: ${path}`)
        await sendPurge(path);    
    }

    if (window.pages && window.pages.dependencies) {
        const deps=window.pages.dependencies;
        for (let i=0;i<deps.length;i++) {
            const dep=deps[i];
            const url=new URL(dep, loc);
            await sendPurge(url.pathname+url.search);
        }
    }

    const outerURL=`https://pages.adobe.com${path}`;

    const resp=await fetch(outerURL, {cache: 'reload', mode: 'no-cors'});

    console.log(`redirecting ${outerURL}`);
    window.location.href=outerURL;            
}

async function sendPurge(path) {
    const resp=await fetch(`https://adobeioruntime.net/api/v1/web/helix/helix-services/purge@v1?host=pages--adobe.hlx.page&xfh=pages.adobe.com&path=${encodeURIComponent(path)}`, {
        method: 'POST'
    });
    const json=await resp.json();
    console.log(JSON.stringify(json));
    return(json);
}

purge();