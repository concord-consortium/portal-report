import { Map } from "immutable";
import { answerHash } from "../../js/util/misc";

describe("misc util functions", () => {
  it("determines if answer hash is properly generated", () => {

    const simpleAnswer1 = Map({ answer: "foo" });
    const simpleAnswer2 = Map({ answer: "foo" });
    const simpleAnswer3 = Map({ answer: "bar" });

    const simpleAnswer1Hash = answerHash(simpleAnswer1);
    const simpleAnswer2Hash = answerHash(simpleAnswer2);
    const simpleAnswer3Hash = answerHash(simpleAnswer3);

    expect(simpleAnswer1Hash).toEqual(simpleAnswer2Hash);
    expect(simpleAnswer1Hash).not.toEqual(simpleAnswer3Hash);
    expect(simpleAnswer2Hash).not.toEqual(simpleAnswer3Hash);

    const complexAnswerContent1 = Map({ image: "www.test.com/image.jpg", text: "foo" });
    const complexAnswerContent2 = Map({ text: "foo", image: "www.test.com/image.jpg" });
    const complexAnswerContent3 = Map({ image: "www.test.com/image.jpg", text: "bar" });
    const complexAnswer1 = Map({ answer: complexAnswerContent1 });
    const complexAnswer2 = Map({ answer: complexAnswerContent2 });
    const complexAnswer3 = Map({ answer: complexAnswerContent3 });

    const complexAnswer1Hash = answerHash(complexAnswer1);
    const complexAnswer2Hash = answerHash(complexAnswer2);
    const complexAnswer3Hash = answerHash(complexAnswer3);

    // this tests the case where the map keys are in different orders, but the content is the same
    expect(complexAnswer1Hash).toEqual(complexAnswer2Hash);

    expect(complexAnswer1Hash).not.toEqual(complexAnswer3Hash);
    expect(complexAnswer2Hash).not.toEqual(complexAnswer3Hash);
  });
});
