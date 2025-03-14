export class UnivTerm {
  year: number;
  semester: 1 | 2;

  constructor(year: number, semester: 1 | 2) {
    this.year = year;
    this.semester = semester;
  }

  next(): UnivTerm {
    const nextYear = this.semester === 2 ? this.year + 1 : this.year;
    const nextSemester = this.semester === 2 ? 1 : 2;
    return new UnivTerm(nextYear, nextSemester);
  }

  isAfter(other: UnivTerm): boolean {
    return (
      this.year > other.year ||
      (this.year === other.year && this.semester > other.semester)
    );
  }

  isSame(other: UnivTerm): boolean {
    return this.year === other.year && this.semester === other.semester;
  }
}
