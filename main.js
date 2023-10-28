const SQUARE_SIZE = 80;



$(document).ready(function () {
    const chessboard = $("#chessboard");

    init_chess_game();
    handleDraggingPiece();

    function create_chessboard() {
        let isWhite = true;
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const square = $("<div>").addClass("square");
                if(isWhite === true) {
                    square.css("background-color", "#eeeed2");
                    isWhite = false;
                }
                else {
                    square.css("background-color", "#769656");
                    isWhite = true;
                }
                chessboard.append(square);
            }
            if(isWhite)
                isWhite = false;
            else
                isWhite = true;
        }
    }


    function init_pieces() {
        let pawn_list = $(".pawn.black");
        let other_piece = $(".special.black");
        for(let i = 0; i < pawn_list.length; i++) {
            $(pawn_list[i]).css({
                "left": SQUARE_SIZE * i + "px",
                "top": SQUARE_SIZE * 1 + "px"
            });
        }
        for(let i = 0; i < other_piece.length; i++) {
            $(other_piece[i]).css({
                "left": SQUARE_SIZE * i + "px",
                "top": SQUARE_SIZE * 0 + "px"
            });
        }

        let pawn_list_white = $(".pawn.white");
        let other_piece_white = $(".special.white");
        for(let i = 0; i < pawn_list_white.length; i++) {
            $(pawn_list_white[i]).css({
                "left": SQUARE_SIZE * i + "px",
                "top": SQUARE_SIZE * 6 + "px"
            });
        }
        for(let i = 0; i < other_piece_white.length; i++) {
            $(other_piece_white[i]).css({
                "left": SQUARE_SIZE * i + "px",
                "top": SQUARE_SIZE * 7 + "px"
            });
        }
    }


    function init_chess_game() {
        create_chessboard();
        init_pieces();
    }

    function handleDraggingPiece() {
        let piece_list = $(".piece");
        for(let i = 0; i < piece_list.length; i++) {
            $(piece_list[i]).draggable({
                containment: "#chessboard",

                stop: function(e, ui) {
                    let leftValue = getLeftValue(e);
                    let topValue = getTopValue(e);  
                    let pieceId = $(this).attr("id");
                    let oldLeft = getRoundValue(parseInt(ui.originalPosition.left));
                    let oldTop = getRoundValue(parseInt(ui.originalPosition.top));
                    // console.log("left value ", leftValue);
                    // console.log("Old left ", oldLeft);
                    // console.log("top value ", topValue);
                    // console.log("Old top ", oldTop);
                    // console.log("\n");
                    if(isValidMove(pieceId, leftValue, topValue, oldLeft, oldTop)) {
                        $(this).css("left", leftValue + "px");
                        $(this).css("top", topValue + "px");
                    } else {
                        ui.helper.animate(ui.originalPosition, "fast");
                    }

                }
            });
        }
        
        
    }
    function getLeftValue(e) {
        let rect = chessboard[0].getBoundingClientRect();
        let value = e.clientX - rect.left;
        for (let i = 0; i < 8; i++) {
            if (SQUARE_SIZE * i <= value && value < SQUARE_SIZE * (i + 1)) {
                return SQUARE_SIZE * i;
            }
        }
        return SQUARE_SIZE * 7;
    }
    
    
    function getTopValue(e) {
        let rect = chessboard[0].getBoundingClientRect();
        let value = e.clientY - rect.top;
        for (let i = 0; i < 8; i++) {
            if (SQUARE_SIZE * i <= value && value < SQUARE_SIZE * (i + 1)) {
                return SQUARE_SIZE * i;
            }
        }
        return SQUARE_SIZE * 7;
    }

    function getRoundValue(value) {
        for (let i = 0; i < 8; i++) {
            if (SQUARE_SIZE * i <= value && value < SQUARE_SIZE * (i + 1)) {
                return SQUARE_SIZE * i;
            }
        }
        return SQUARE_SIZE * 7;
    } 

    function isValidMove(pieceId, leftValue, topValue, oldLeft, oldTop) {
        const piece_list = $(".piece");
        for(let i = 0; i < piece_list.length; i++) {
            const current_piece = $(piece_list[i]);
            const current_top = parseInt(current_piece.css("top"));
            const current_left = parseInt(current_piece.css("left"));
            if(leftValue === current_left && topValue === current_top) {
                console.log("square already occupied");
                return false;
            }
        }

        // validate move for white pawn
        if(pieceId.match("pawn-white")) {
            if(leftValue !== oldLeft) {
                console.log("Cannot move left or right");
                return false;
            }
            if(topValue === SQUARE_SIZE * 5 || topValue === SQUARE_SIZE * 4) {
                if(topValue > oldTop) {
                    console.log("Cannot move back (1)");
                    return false;
                }
                return true;
            }
            if(topValue > oldTop || Math.abs(topValue - oldTop) > SQUARE_SIZE) {
                console.log("Cannot move back or move more than accepted (2)");
                return false;
            }
            return true;
        }

        // validate move for black pawn
        if(pieceId.match("pawn-black")) {
            if(leftValue !== oldLeft) {
                console.log("Cannot move left or right");
                return false;
            }
            if(topValue === SQUARE_SIZE * 2 || topValue === SQUARE_SIZE * 3) {
                if(topValue < oldTop) {
                    console.log("Cannot move back (1)");
                    return false;
                }
                return true;
            }
            if(topValue < oldTop || Math.abs(topValue - oldTop) > SQUARE_SIZE) {
                console.log("Cannot move back or move more than accepted (2)");
                return false;
            }
            return true;
        }

        // validate move for king
        if(pieceId.match("king")) {
            // console.log("leftvalue", leftValue);
            // console.log("old left", oldLeft);
            // console.log("topvalue", topValue);
            // console.log("old top", oldTop);
            // console.log("\n");
            if(Math.abs(leftValue - oldLeft) > SQUARE_SIZE 
            || Math.abs(topValue - oldTop) > SQUARE_SIZE) { 
                console.log("Invalid king move");
                return false;
            }
            return true;
        }
        // validate move for rook
        if(pieceId.match("rook")) {
            // cannot move diagonally
            if(leftValue !== oldLeft && topValue !== oldTop)
                return false;

            // validate rook's path
            if(isBlockedPath(pieceId, leftValue, topValue, oldLeft, oldTop))
                return false;
            
            return true;
        }

        // validate move for bishop
        if(pieceId.match("bishop")) {
            if(Math.abs(topValue - oldTop) !== Math.abs(leftValue - oldLeft)) {
                return false;
            }
            // validate bishop's path
            if(isBlockedPath(pieceId, leftValue, topValue, oldLeft, oldTop)) {
                return false;
            }
            return true;
        }

        //validate move for knight
        if(pieceId.match("knight")) {
            if(Math.abs(topValue - oldTop) === 2 * SQUARE_SIZE 
                && Math.abs(leftValue - oldLeft) === SQUARE_SIZE)
                return true;
            if(Math.abs(topValue - oldTop) ===  SQUARE_SIZE 
                && Math.abs(leftValue - oldLeft) === 2 * SQUARE_SIZE)
                return true;    
            return false;
        }

        //validate move for queen
        if(pieceId.match("queen")) {
            if((leftValue === oldLeft && topValue !== oldTop) || (topValue === oldTop && leftValue !== oldLeft)) {
                if(isBlockedPath(pieceId, leftValue, topValue, oldLeft, oldTop)) {
                    return false;
                }
                return true;
            }
                
            if(Math.abs(leftValue - oldLeft) === Math.abs(topValue - oldTop)) {
                if(isBlockedPath(pieceId, leftValue, topValue, oldLeft, oldTop)) {
                    return false;
                }
                return true;
            }
        }      
    }


    function euclidDistance(x1, x2, y1, y2) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }
    
    function isBlockedPath(pieceId, leftValue, topValue, oldLeft, oldTop) {
        const all_pieces = $(".piece");
        for(let i = 0; i < all_pieces.length; i++) {
            if(pieceId === $(all_pieces[i]).attr("id"))
                continue;
            let piece_top = parseInt($(all_pieces[i]).css("top"));
            let piece_left = parseInt($(all_pieces[i]).css("left"));
            let oldPos_to_piece = euclidDistance(piece_left, oldLeft, piece_top, oldTop);
            let newPos_to_piece = euclidDistance(piece_left, leftValue, piece_top, topValue);
            let oldPos_to_newPos = euclidDistance(leftValue, oldLeft, topValue, oldTop);
    
            if(oldPos_to_piece + newPos_to_piece === oldPos_to_newPos) {
                console.log("Blocked by: ", $(all_pieces[i]).attr("id"));
                return true;
            }
        }
        return false;
    }

    


    




});