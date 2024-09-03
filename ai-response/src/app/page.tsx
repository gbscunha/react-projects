"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";
import Image from "next/image";
import { Label } from "./_components/ui/label";
import { Textarea } from "./_components/ui/textarea";
import { Button } from "./_components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./_components/ui/select";
// import { Alert, AlertDescription, AlertTitle } from "./_components/ui/alert";

const AIResponseEvaluator = () => {
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [correctResponse, setCorrectResponse] = useState("");
  const [candidateResponse, setCandidateResponse] = useState("");
  const [evaluation, setEvaluation] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          candidateResponse,
          correctResponse,
          prompt,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response from API:", data);
      setRawResponse(data.result);
      const { score, justification } = parseOpenAIResponse(data.result);
      setEvaluation(score);
      setJustification(justification);
    } catch (error) {
      console.error("Error evaluating response:", error);
      setEvaluation(null);
      setJustification(
        "Error occurred during AI evaluation. Please try again later."
      );
      setRawResponse("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  const parseOpenAIResponse = (response: string) => {
    const lines = response.trim().split("\\n");
    let score = null;
    let justification = "";

    for (const line of lines) {
      if (line.startsWith("Evaluation Score")) {
        const scoreText = line.split(":")[1].trim();
        score = parseFloat(scoreText);
      } else if (line.startsWith("Justification")) {
        justification = line.split(":")[1].trim();
      }
    }

    return { score, justification };
  };

  const getScoreText = (score: number) => {
    if (score === 1) return "Correct (1.0)";
    if (score === 0.5) return "Partially correct (0.5)";
    return "Incorrect (0)";
  };

  const getScoreColor = (score: number) => {
    if (score === 1) return "bg-green-100 border-green-400 text-green-700";
    if (score === 0.5) return "bg-yellow-100 border-yellow-400 text-yellow-700";
    return "bg-red-100 border-red-400 text-red-700";
  };

  return (
    <Card className="bg-slate-50 w-full max-w-2xl mx-auto">
      <CardHeader className="flex items-start justify-between">
        <div className="mt-2 flex items-center gap-2">
        <Image
          src="/aifilled.svg"
          width={30}
          height={30}
          alt="Picture of the author"
        />  
        <CardTitle>Corretor inteligente</CardTitle>
        </div>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecione o modelo da IA" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="gpt-4-turbo">ChatGPT 4</SelectItem>
              <SelectItem value="gpt-4o">ChatGPT 4o</SelectItem>
              <SelectItem value="gpt-3.5-turbo">ChatGPT 3.5</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Mensagem para o ChatGPT"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Questão</Label>
            <Textarea
              id="question"
              placeholder="Insira a questão aqui..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correctResponse">Resposta esperada</Label>
            <Textarea
              id="correctResponse"
              placeholder="Insira a resposta esperada aqui..."
              value={correctResponse}
              onChange={(e) => setCorrectResponse(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidateResponse">Resposta do candidato</Label>
            <Textarea
              id="candidateResponse"
              placeholder="Insira a resposta do candidato aqui..."
              value={candidateResponse}
              onChange={(e) => setCandidateResponse(e.target.value)}
              rows={2}
            />
          </div>
          <Button
            onClick={handleEvaluate}
            disabled={
              loading || !question || !correctResponse || !candidateResponse
            }
          >
            {loading ? "Avaliando..." : "Avaliar resposta"}
          </Button>
          {rawResponse && (
            <div className="space-y-2">
              <Label>Avaliação da AI:</Label>
              <Textarea
                value={rawResponse}
                readOnly
                rows={6}
                className="bg-gray-100"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIResponseEvaluator;
