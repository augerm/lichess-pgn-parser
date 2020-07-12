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
      // Moves should always be defined
      const whiteMoves = this.pgn.match(/(?<=(\d)*\. )\S*/g) as string[];
      const blackMoves = this.pgn.match(/(?<=} )\S*(?= {)/g) as string[];
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
}