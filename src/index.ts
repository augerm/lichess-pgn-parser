import moment from 'moment';

type Header = {[key: string]: number};

interface PGNData {
  headers: Header[];
  moves: string[];
  moveTimings: number[] | null;
  pgn: string;
}

export class PGN {
    public headers: Array<Header>;
    public moveTimings: number[] | null;
    public pgn: string;
    public moves: string[];
    public timeControl: {white: number, black: number};

    constructor(pgnStr: string) {
      this.pgn = pgnStr;
      this.headers = this.parseHeaders();
      this.moveTimings = this.parseMoveTimings() || [];
      this.timeControl = {
        white: this.moveTimings[0],
        black: this.moveTimings[1],
      }
      this.moves = this.parseMoves();
    }

    parseHeaders() {
      const pgnStrLineByLine = this.pgn.split('\n');
      const headers: any = {};
      for(const line of pgnStrLineByLine) {
        if(line.startsWith('[')) {
          const prunedLine = line.replace(/[\[\]\"]/g, '');
          const [key, val] = prunedLine.split(' ', 2);
          headers[key] = val;
        }
      }
      return headers;
    }

    parseMoves() {
      let whiteMoves: string[] = [];
      let blackMoves: string[] = [];

      /** i.e... 1. (e4) (e5) */
      const regEx = /\d*\. ([\S]*) ?([\S]*)/g;

      let result;
      while((result = regEx.exec(this.pgn)) !== null) {
        const [/* ignore match value when destructuring */, whiteMove, blackMove] = result;
        if(this.isMove(whiteMove)) whiteMoves.push(this.cleanMove(whiteMove));
        if(this.isMove(blackMove)) blackMoves.push(this.cleanMove(blackMove));
      }
      const allMoves = [];
      for(let i = 0; i < whiteMoves.length; i++) {
        const tempMoves = [whiteMoves[i]];
        if(blackMoves[i]) tempMoves.push(blackMoves[i]);
        allMoves.push(...tempMoves);
      }
      return allMoves; 
    }

    parseMoveTimings() {
      const clockTimings = this.pgn.match(/(?<=%clk )[\d:]*/g);
      if(!clockTimings) return null;

      const moveTimings = [];
      for(let i = 0; i < clockTimings.length - 2; i++) {
        const t1 = moment(clockTimings[i], "hh:mm:ss");
        const t2 = moment(clockTimings[i + 2], "hh:mm:ss");
        moveTimings.push(t1.valueOf() - t2.valueOf());
      }
      return moveTimings;
    }

    get(): PGNData {
      return {
        pgn: this.pgn,
        headers: this.headers,
        moveTimings: this.moveTimings,
        moves: this.moves,
      }
    }

    print() {
      console.log(this.pgn);
      console.log(this.headers);
      console.log(this.moveTimings?.length);
      console.log(this.moves.length);
    }

    isMove(value: string) {
      return !(value === '1-0' || value === '0-1' || value === '1/2-1/2');
    }

    cleanMove(move: string) {
      return move.replace(/#|\+/g, '');
    }
}

// const pgn = new PGN(`[Event "Rated Classical game"]
// [Site "https://lichess.org/a9tcp02g"]
// [White "Desmond_Wilson"]
// [Black "savinka59"]
// [Result "1-0"]
// [UTCDate "2012.12.31"]
// [UTCTime "23:04:12"]
// [WhiteElo "1654"]
// [BlackElo "1919"]
// [WhiteRatingDiff "+19"]
// [BlackRatingDiff "-22"]
// [ECO "D04"]
// [Opening "Queen's Pawn Game: Colle System, Anti-Colle"]
// [TimeControl "480+2"]
// [Termination "Normal"]

// 1. d4 d5 2. Nf3 Nf6 3. e3 Bf5 4. Nh4 Bg6 5. Nxg6 hxg6 6. Nd2 e6 7. Bd3 Bd6 8. e4 dxe4 9. Nxe4 Rxh2 10. Ke2 Rxh1 11. Qxh1 Nc6 12. Bg5 Ke7 13. Qh7 Nxd4+ 14. Kd2 Qe8 15. Qxg7 Qh8 16. Bxf6+ Kd7 17. Qxh8 Rxh8 18. Bxh8 1-0`);
// pgn.print();