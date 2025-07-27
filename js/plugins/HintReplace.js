//=============================================================================
// HintReplace.js
//=============================================================================
/*:
 * @plugindesc ヒント用文字列を変換
 *
 * @author Micelle
 */
//=============================================================================

(function () {

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'HintReplace') {

             const v = $gameVariables.value.bind($gameVariables);
            const setV = $gameVariables.setValue.bind($gameVariables);

             //------------------------------
            // HintReplace righthint
            //------------------------------
            if (args[0] === 'righthint') {
                const val169 = v(169);
                console.log("righthint 実行 - 変数169:", val169);

                if (typeof val169 === 'string' && val169.includes(',')) {
                    const parts = val169.split(',');
                    const part1 = parts[0] || '';
                    const part2 = parts[1] || '';

                    $gameVariables.setValue(169, part1);
                    $gameVariables.setValue(1671, part2);

                    console.log("カンマ分割検出: 169→", part1, ", 1671→", part2);
                    return;
                }


                if (val169 === 0 || val169 === '0') {
                    const head = v(1057);
                    const core = v(9);
                    const tail = v(1058);

                    console.log("head:", JSON.stringify(head));
                    console.log("core:", core);
                    console.log("tail:", JSON.stringify(tail));

                    const chars = core.split("");
                    let keepIndices = [];
                    let isolatedIndices = [];

                    // ₨の右隣インデックス
                    for (let i = 0; i < chars.length - 1; i++) {
                        if (chars[i] === '₨' && /[ぁ-んー・a-zA-Z0-9]/.test(chars[i + 1])) {
                            keepIndices.push(i + 1);
                        }
                    }

                    // ₨なし孤立文字
                    for (let i = 0; i < chars.length; i++) {
                        if (chars[i] === '₨') continue;
                        if (i === 0 || chars[i - 1] !== '₨') {
                            isolatedIndices.push(i);
                        }
                    }

                    if (isolatedIndices.length >= 2) {
                        keepIndices.push(isolatedIndices[0]);
                    } else {
                        console.log("孤立文字が1個以下のため、righthint終了");
                        return;
                    }

                    let convertedCore = '';
                    for (let i = 0; i < chars.length; i++) {
                        if (chars[i] === '₨') continue;
                        if (keepIndices.includes(i)) {
                            convertedCore += chars[i];
                        } else if (/[ぁ-んー・a-zA-Z0-9]/.test(chars[i])) {
                            convertedCore += '●';
                        } else {
                            convertedCore += chars[i];
                        }
                    }

                    const parts = [];
                    if (head && head !== '0' && head.trim() !== '') {
                        parts.push(`[${head}]`);
                    }
                    parts.push(convertedCore);
                    if (tail && tail !== '0' && tail.trim() !== '') {
                        parts.push(`[${tail}]`);
                    }

                    const fullText = parts.join('');
                    setV(169, fullText);
                    console.log("変数169に設定:", fullText);
                }
            }
        
            //------------------------------
            // HintReplace righthint_lead
            //------------------------------
            else if (args[0] === 'righthint_lead') {
            const varIds = [9, 10, 11];
                const outputIds = [1671, 1672, 1673];

                for (let i = 0; i < varIds.length; i++) {
                    const value = $gameVariables.value(varIds[i]);
                    console.log(`変数${varIds[i]}の元の値:`, JSON.stringify(value));

                    // 変数10,11が特定の文字列ならスキップ
                    if ((varIds[i] === 10 || varIds[i] === 11) && value === "000000000000000000000") {
                    console.log(`変数${varIds[i]}はスキップされました`);
                    continue;
                    }

                    let chars = value.split("");
                    let markedIndices = [];
                    let unmarkedIndices = [];

                    for (let j = 0; j < chars.length; j++) {
                    if (chars[j] === "₨" && j + 1 < chars.length) {
                        markedIndices.push(j + 1);
                        j++; // skip the marked character
                    } else {
                        unmarkedIndices.push(j);
                    }
                    }

                    console.log(`₨でマークされた文字数: ${markedIndices.length}`);

                    if (unmarkedIndices.length <= 1) {
                    console.log(`₨でマークされていない文字が1つ以下のため、変数${varIds[i]}は処理されません`);
                    continue;
                    }

                    // 最初の₨なし文字の左に₨を追加
                    const insertIndex = unmarkedIndices[0];
                    chars.splice(insertIndex, 0, "₨");
                    console.log(`₨をインデックス${insertIndex}に追加後:`, chars.join(""));

                    // ₨とその右隣の文字を削除
                    let result = "";
                    for (let j = 0; j < chars.length; j++) {
                    if (chars[j] === "₨" && j + 1 < chars.length) {
                        j++; // skip ₨ and the next character
                    } else {
                        result += chars[j];
                    }
                    }

                    console.log(`変数${outputIds[i]}に代入する最終結果:`, JSON.stringify(result));
                    $gameVariables.setValue(outputIds[i], result);
                }
                }


            //------------------------------
            // HintReplace scalecalc
            //------------------------------
            else if (args[0] === 'scalecalc') {
                const fullText = v(169);
                if (!fullText || typeof fullText !== 'string') return;

                console.log("scalecalc 実行 - 文字列:", fullText);

                let total = 0;
                let insideBrackets = false;
                let insideTag = false;
                let skippingRightSide = false;

                for (let i = 0; i < fullText.length; i++) {
                    const ch = fullText[i];
                    const code = ch.charCodeAt(0);

                    // [] 対応
                    if (ch === '[') {
                        insideBrackets = true;
                        console.log(`「[」検出 → 処理スキップ`);
                        continue;
                    }
                    if (ch === ']') {
                        insideBrackets = false;
                        console.log(`「]」検出 → 処理スキップ`);
                        continue;
                    }

                    // <|> バリアント対応
                    if (ch === '<') {
                        insideTag = true;
                        skippingRightSide = false;
                        console.log(`「<」検出 → タグ開始`);
                        continue;
                    }
                    if (ch === '>') {
                        insideTag = false;
                        skippingRightSide = false;
                        console.log(`「>」検出 → タグ終了`);
                        continue;
                    }
                    if (ch === '|' && insideTag) {
                        skippingRightSide = true;
                        console.log(`「|」検出 → バリアント右側スキップ開始`);
                        continue;
                    }
                    if (skippingRightSide) {
                        console.log(`「${ch}」はバリアント右側のためスキップ`);
                        continue;
                    }

                    // 括弧・スペース・● の明示チェック（コードで判定）
                    if (
                        ch === '　' || ch === '●' || ch === '、' || ch === '。' ||
                        [0x300C, 0x300D, 0x300E, 0x300F, 0xFF08, 0xFF09, 0x3010, 0x3011].includes(code)
                    ) {
                        total += 10;
                        console.log(`「${ch}」を全角括弧/記号/スペース/●として +10 (total=${total})`);
                        continue;
                    }

                    // 制御文字除外
                    if ('\\[]<>|'.includes(ch)) {
                        console.log(`「${ch}」は制御文字としてスキップ`);
                        continue;
                    }

                    // 半角英数・半角記号
                    if (/[ -~]/.test(ch)) {
                        const point = insideBrackets ? 6 : 8;
                        total += point;
                        console.log(`「${ch}」を半角として +${point} (total=${total})`);
                        continue;
                    }

                    // 全角文字（ひらがな・カタカナ・漢字・全角記号）
                    if (
                        (code >= 0x3040 && code <= 0x30FF) || // ひらがな・カタカナ
                        (code >= 0x4E00 && code <= 0x9FFF) || // 漢字
                        (code >= 0xFF01 && code <= 0xFF5E)    // 全角英数記号
                    ) {
                        total += 10;
                        console.log(`「${ch}」を全角文字として +10 (total=${total})`);
                        continue;
                    }

                    // 上記すべてに当てはまらない
                    console.log(`「${ch}」は未分類（ノーカウント）`);
                }

                console.log("ポイント合計:", total);

                let scaleX = 100;
                let offsetX = 0;

                if (total > 110) {
                    const over = total - 110;

                    // scaleX：110→100、150→75
                    scaleX = Math.max(75, 100 - Math.floor((over * 25) / 40));

                    // offsetX：110→0、150→54（なだらかなカーブ）
                    offsetX = Math.floor((over * 1.05) + (over * over) / 130);

                        if (total === 140) {
                           scaleX = 78;
                          offsetX = 40;
                        }
                }

                setV(1636, scaleX);
                setV(1640, offsetX);
                console.log("拡大率:", scaleX, " 座標ズレ:", offsetX);
            }

            //------------------------------
            // HintReplace left
            //------------------------------

                else if (args[0] === 'left') {
                    const input = $gameVariables.value(9);
                    const input10 = $gameVariables.value(10);
                    const input11 = $gameVariables.value(11);
                    const targetVars = [775, 776];

                    function buildKeepList(text) {
                        const list = [];
                        for (let i = 0; i < text.length - 1; i++) {
                            if (text[i] === '₨' && /[ぁ-んー・a-zA-Z0-9]/.test(text[i + 1])) {
                                list.push(text[i + 1]);
                            }
                        }
                        return list;
                    }

                    function buildMasked(text, keepList) {
                        let masked = '', plain = '';
                        for (let i = 0; i < text.length; i++) {
                            const c = text[i];
                            if (c === '₨') continue;
                            plain += c;
                            if (/[ぁ-んー・a-zA-Z0-9]/.test(c)) {
                                const idx = keepList.indexOf(c);
                                if (idx !== -1) {
                                    masked += c;
                                    keepList.splice(idx, 1);
                                } else {
                                    masked += '●';
                                }
                            } else {
                                masked += '●';
                            }
                        }
                        return { plain, masked };
                    }

                    function applyMask(source, masked, target) {
                        const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const plainRegex = new RegExp(escapeRegExp(source), 'g');
                        const katakanaRegex = new RegExp(escapeRegExp(toKatakana(source)), 'g');

                        if (plainRegex.test(target)) {
                            return target.replace(plainRegex, masked);
                        } else if (katakanaRegex.test(target)) {
                            return target.replace(katakanaRegex, toKatakana(masked));
                        }
                        return target;
                    }

                    // まず変数9を元にマスク
                    const keepList9 = buildKeepList(input);
                    const { plain: plain9, masked: masked9 } = buildMasked(input, keepList9);

                    const afterMask = {};
                    for (const varId of targetVars) {
                        const original = $gameVariables.value(varId);
                        afterMask[varId] = applyMask(plain9, masked9, original);
                    }

                    // 続いて、input10 が有効なら、さらに上書き
                    if (input10 !== "000000000000000000000") {
                        const keepList10 = buildKeepList(input10);
                        const { plain: plain10, masked: masked10 } = buildMasked(input10, keepList10);

                        for (const varId of targetVars) {
                            afterMask[varId] = applyMask(plain10, masked10, afterMask[varId]);
                        }
                    }

                    if (input11 !== "000000000000000000000") {
                        const keepList11 = buildKeepList(input11);
                        const { plain: plain11, masked: masked11 } = buildMasked(input11, keepList11);

                        for (const varId of targetVars) {
                            afterMask[varId] = applyMask(plain11, masked11, afterMask[varId]);
                        }
                    }

                    // 書き戻し
                    for (const varId of targetVars) {
                        $gameVariables.setValue(varId, afterMask[varId]);
                        }
                    }
        

            // 通常の HintReplace a b の処理
            
            else if (args.length >= 2) {
                const inputVarId = Number(args[0]);
                const outputVarId = Number(args[1]);
                const input = $gameVariables.value(inputVarId);

                let output = '';
                for (let i = 0; i < input.length; i++) {
                    const char = input[i];
                    if (char === '₨') continue;
                    // ₨の右隣だけそのまま、それ以外は●
                    if (i > 0 && input[i - 1] === '₨') {
                        output += char;
                    } else {
                        output += /[ぁ-んー・a-zA-Z0-9]/.test(char) ? '●' : char;
                    }
                }

                $gameVariables.setValue(outputVarId, output);
            }
        }
    };

    // 平仮名→カタカナ変換
    function toKatakana(str) {
        return str.replace(/[ぁ-ん]/g, ch => {
            return String.fromCharCode(ch.charCodeAt(0) + 0x60);
        });
    }

})();