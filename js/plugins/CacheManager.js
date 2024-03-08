(function () {

    const data_de = [
        ["Explosion_", 18],
        ["Lv01A_0000", 8],
        ["Lv02A_0000", 8],
        ["Lv03A_0000", 8],
        ["Lv04A_0000", 8],
        ["Lv01_ap_", 12],
        ["Lv02_ap_", 12],
        ["Lv03_ap_", 12],
        ["Lv04_ap_", 12],
        ["Lv05_ap_", 12],
        ["Lv06_ap_", 12],
        ["LvF_ap_", 12],
        ["St01_ap_", 12],
        ["St02_ap_", 12],
        ["St03_ap_", 12],
        ["Enemy_01A_0", 51],
        ["Enemy_02A_0", 54],
        ["Enemy_03A_0", 52],
        ["Enemy_04Aa_0", 61],
        ["Enemy_04Ab_0", 29],
        ["Enemy_04Ac_0", 61],
    ];

    const data_aq = [
        ["Explosion_Aq_", 18],
        ["Lv01B_0000", 8],
        ["Lv02B_0000", 8],
        ["Lv03B_0000", 8],
        ["Lv04B_0000", 8],
        ["Lv01_ap_Aq_", 12],
        ["Lv02_ap_Aq_", 12],
        ["Lv03_ap_Aq_", 12],
        ["Lv04_ap_Aq_", 12],
        ["Lv05_ap_Aq_", 12],
        ["Lv06_ap_Aq_", 12],
        ["LvF_ap_Aq_", 12],
        ["St01_ap_Aq_", 12],
        ["St02_ap_Aq_", 12],
        ["St03_ap_Aq_", 12],
        ["Enemy_01B_0", 52],
        ["Enemy_02B_0", 52],
        ["Enemy_03B_0", 52],
        ["Enemy_04Ba_0", 56],
        ["Enemy_04Bb_0", 37],
        ["Enemy_04Bc_0", 61],
    ];

    const data_sk = [
        ["Explosion_", 18],
        ["Lv01C_0000", 8],
        ["Lv02C_0000", 8],
        ["Lv03C_0000", 8],
        ["Lv04C_0000", 8],
        ["Lv01_ap_Sk_", 12],
        ["Lv02_ap_Sk_", 12],
        ["Lv03_ap_Sk_", 12],
        ["Lv04_ap_Sk_", 12],
        ["Lv05_ap_Sk_", 12],
        ["Lv06_ap_Sk_", 12],
        ["LvF_ap_Sk_", 12],
        ["St01_ap_Sk_", 12],
        ["St02_ap_Sk_", 12],
        ["St03_ap_Sk_", 12],
        ["Enemy_01C_0", 52],
        ["Enemy_02C_0", 52],
        ["Enemy_03C_0", 52],
        ["Enemy_04Ca_0", 59],
        ["Enemy_04Cb_0", 42],
        ["Enemy_04Cc_0", 60],
    ];


    const uniqueData_de = [
        "Clear_A",
        "Clear_B",
        "Clear_C",
        "ClearH_A",
        "ClearH_B",
        "ClearH_C",
        "Lv01_ap_L",
        "Lv02_ap_L",
        "Lv03_ap_L",
        "Lv04_ap_L",
        "Lv05_ap_L",
        "Lv06_ap_L",
        "LvF_ap_L",
        "St01_ap_L",
        "St02_ap_L",
        "St03_ap_L",
        "Enemy_02A_038",
    ];

    const uniqueData_Aq = [
        "Clear_Aq",
        "Clear_Aq_Hell",
        "Clear_Aq_Light_01",
        "Clear_Aq_Light_02",
    ];

    const uniqueData_Sk = [
        "Clear_Sk",
        "Clear_Sk_SlA",
        "Clear_Sk_SlA",
        "Enemy_04Cc_060",
    ];

    const DataList = [data_de, data_aq, data_sk];
    const uniqueDataList = [uniqueData_de, uniqueData_Aq, uniqueData_Sk];

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'Preload') {
            const data = DataList[parseInt(args[0])];
            const uniqueData = uniqueDataList[parseInt(args[0])];
            const lighten = parseInt(args[1]);
            for (const set of data) {
                const str = set[0];
                const num = parseInt(set[1]);
                const length = num.toString().length;
                for (var i = 1; i < num + 1; i++) {
                    if (str.includes("Enemy") && lighten != 0) {
                        if (i % 2 == 0 && !str.includes("Enemy_04Cb")) {
                            continue;
                        } else if (i % 2 == 1 && str.includes("Enemy_04Cb") && i >= 4) {
                            continue;
                        }
                    }
                    if (str.includes("_0000") && i != 1 && lighten == 2) continue;
                    Galv.CACHE.load('pictures', `${str}${i.toString().padStart(length, '0')}`);
                    //console.log(`${str}${i.toString().padStart(length, '0')} preloaded`);
                }
            }
            for (const picture of uniqueData) {
                Galv.CACHE.load('pictures', picture);
            }
        } else if (command === 'Preload_Free') {
            ImageManager.releaseReservation(1);
        }
    };

})();
