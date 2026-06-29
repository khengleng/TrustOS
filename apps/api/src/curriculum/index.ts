import { cambodiaMoeysCurriculumMap } from "./cambodiaMoeys";
import { cambridgeCurriculumMap } from "./cambridge";
import type { CurriculumCode, CurriculumMapItem, GradeLevel, SubjectCode } from "../types";

const curriculumMap: CurriculumMapItem[] = [
  ...cambridgeCurriculumMap,
  ...cambodiaMoeysCurriculumMap,
];

export function getCurriculumMapItems(filters?: {
  curriculum?: CurriculumCode;
  grade?: GradeLevel;
  subject?: SubjectCode;
}) {
  return curriculumMap.filter((item) => {
    if (filters?.curriculum && item.curriculum !== filters.curriculum) {
      return false;
    }

    if (filters?.grade && item.grade !== filters.grade) {
      return false;
    }

    if (filters?.subject && item.subject !== filters.subject) {
      return false;
    }

    return true;
  });
}
