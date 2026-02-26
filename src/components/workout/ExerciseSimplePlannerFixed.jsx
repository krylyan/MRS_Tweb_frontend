import React, { useState } from "react";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";

export default function ExerciseSimplePlanner() {
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState({
    main: null,
    secondary: null,
    accessory: null,
    finisher: null,
  });

  const muscleGroups = [
    { id: "spate", label: "Spate" },
    { id: "piept", label: "Piept" },
    { id: "maini", label: "Maini" },
    { id: "picioare", label: "Picioare" },
    { id: "umeri", label: "Umeri" },
  ];

  const exerciseDatabase = {
    spate: {
      main: [
        { name: "Deadlift", sets: 4, reps: 6, restSec: 120 },
        { name: "Barbell Row", sets: 4, reps: 8, restSec: 90 },
        { name: "Weighted Pull-Up", sets: 4, reps: 6, restSec: 120 },
        { name: "T-Bar Row", sets: 4, reps: 8, restSec: 90 },
      ],
      secondary: [
        { name: "Lat Pulldown", sets: 3, reps: 10, restSec: 75 },
        { name: "Seated Cable Row", sets: 3, reps: 10, restSec: 75 },
        { name: "Chest-Supported Row", sets: 3, reps: 12, restSec: 60 },
        { name: "Close Grip Pulldown", sets: 3, reps: 12, restSec: 60 },
      ],
      accessory: [
        { name: "Straight Arm Pulldown", sets: 3, reps: 12, restSec: 45 },
        { name: "Face Pull", sets: 3, reps: 15, restSec: 45 },
        { name: "Dumbbell Pullover", sets: 3, reps: 12, restSec: 45 },
        { name: "Rear Delt Fly", sets: 3, reps: 15, restSec: 45 },
      ],
      finisher: [
        { name: "Back Extension", sets: 2, reps: 15, restSec: 30 },
        { name: "Band Row Burnout", sets: 2, reps: 20, restSec: 30 },
        { name: "Dead Hang", sets: 2, reps: "40s", restSec: 30 },
        { name: "Farmer Carry", sets: 2, reps: "30m", restSec: 30 },
      ],
    },
    piept: {
      main: [
        { name: "Barbell Bench Press", sets: 4, reps: 6, restSec: 120 },
        { name: "Incline Barbell Press", sets: 4, reps: 8, restSec: 90 },
        { name: "Weighted Dip", sets: 4, reps: 8, restSec: 90 },
        { name: "Dumbbell Bench Press", sets: 4, reps: 8, restSec: 90 },
      ],
      secondary: [
        { name: "Incline Dumbbell Press", sets: 3, reps: 10, restSec: 75 },
        { name: "Machine Chest Press", sets: 3, reps: 10, restSec: 75 },
        { name: "Decline Press", sets: 3, reps: 10, restSec: 75 },
        { name: "Smith Bench Press", sets: 3, reps: 10, restSec: 75 },
      ],
      accessory: [
        { name: "Cable Fly", sets: 3, reps: 12, restSec: 45 },
        { name: "Pec Deck Fly", sets: 3, reps: 12, restSec: 45 },
        { name: "Push-Up", sets: 3, reps: 15, restSec: 45 },
        { name: "Low Cable Crossover", sets: 3, reps: 12, restSec: 45 },
      ],
      finisher: [
        { name: "Push-Up Burnout", sets: 2, reps: 20, restSec: 30 },
        { name: "Isometric Chest Squeeze", sets: 2, reps: "30s", restSec: 30 },
        { name: "Banded Push-Up", sets: 2, reps: 15, restSec: 30 },
        { name: "Chest Stretch Hold", sets: 2, reps: "40s", restSec: 30 },
      ],
    },
    maini: {
      main: [
        { name: "Close Grip Bench Press", sets: 4, reps: 8, restSec: 90 },
        { name: "Barbell Curl", sets: 4, reps: 8, restSec: 75 },
        { name: "Skull Crusher", sets: 4, reps: 8, restSec: 75 },
        { name: "Weighted Chin-Up", sets: 4, reps: 8, restSec: 90 },
      ],
      secondary: [
        { name: "EZ Bar Curl", sets: 3, reps: 10, restSec: 60 },
        { name: "Triceps Pushdown", sets: 3, reps: 10, restSec: 60 },
        { name: "Seated Dumbbell Curl", sets: 3, reps: 10, restSec: 60 },
        { name: "Overhead Triceps Extension", sets: 3, reps: 10, restSec: 60 },
      ],
      accessory: [
        { name: "Hammer Curl", sets: 3, reps: 12, restSec: 45 },
        { name: "Rope Pushdown", sets: 3, reps: 12, restSec: 45 },
        { name: "Incline Curl", sets: 3, reps: 12, restSec: 45 },
        { name: "Single Arm Pushdown", sets: 3, reps: 12, restSec: 45 },
      ],
      finisher: [
        { name: "21s Biceps Curl", sets: 2, reps: 21, restSec: 30 },
        { name: "Diamond Push-Up", sets: 2, reps: 15, restSec: 30 },
        { name: "Reverse Curl Burnout", sets: 2, reps: 18, restSec: 30 },
        { name: "Triceps Bench Dip", sets: 2, reps: 20, restSec: 30 },
      ],
    },
    picioare: {
      main: [
        { name: "Back Squat", sets: 4, reps: 6, restSec: 120 },
        { name: "Romanian Deadlift", sets: 4, reps: 8, restSec: 90 },
        { name: "Leg Press", sets: 4, reps: 10, restSec: 90 },
        { name: "Front Squat", sets: 4, reps: 6, restSec: 120 },
      ],
      secondary: [
        { name: "Walking Lunge", sets: 3, reps: 10, restSec: 75 },
        { name: "Bulgarian Split Squat", sets: 3, reps: 10, restSec: 75 },
        { name: "Hack Squat", sets: 3, reps: 10, restSec: 75 },
        { name: "Step-Up", sets: 3, reps: 12, restSec: 60 },
      ],
      accessory: [
        { name: "Leg Extension", sets: 3, reps: 12, restSec: 45 },
        { name: "Leg Curl", sets: 3, reps: 12, restSec: 45 },
        { name: "Standing Calf Raise", sets: 3, reps: 15, restSec: 45 },
        { name: "Seated Calf Raise", sets: 3, reps: 15, restSec: 45 },
      ],
      finisher: [
        { name: "Bodyweight Squat Burnout", sets: 2, reps: 25, restSec: 30 },
        { name: "Wall Sit", sets: 2, reps: "45s", restSec: 30 },
        { name: "Jump Squat", sets: 2, reps: 15, restSec: 30 },
        { name: "High Knees", sets: 2, reps: "40s", restSec: 30 },
      ],
    },
    umeri: {
      main: [
        { name: "Barbell Overhead Press", sets: 4, reps: 6, restSec: 120 },
        { name: "Dumbbell Shoulder Press", sets: 4, reps: 8, restSec: 90 },
        { name: "Push Press", sets: 4, reps: 6, restSec: 120 },
        { name: "Arnold Press", sets: 4, reps: 8, restSec: 90 },
      ],
      secondary: [
        { name: "Lateral Raise", sets: 3, reps: 12, restSec: 60 },
        { name: "Rear Delt Fly", sets: 3, reps: 12, restSec: 60 },
        { name: "Cable Lateral Raise", sets: 3, reps: 12, restSec: 60 },
        { name: "Upright Row", sets: 3, reps: 10, restSec: 60 },
      ],
      accessory: [
        { name: "Front Raise", sets: 3, reps: 12, restSec: 45 },
        { name: "Face Pull", sets: 3, reps: 15, restSec: 45 },
        { name: "Cable Rear Delt Fly", sets: 3, reps: 15, restSec: 45 },
        { name: "Dumbbell Shrug", sets: 3, reps: 12, restSec: 45 },
      ],
      finisher: [
        { name: "Lateral Raise Burnout", sets: 2, reps: 20, restSec: 30 },
        { name: "Band Pull Apart", sets: 2, reps: 25, restSec: 30 },
        { name: "Plate Front Raise Hold", sets: 2, reps: "30s", restSec: 30 },
        { name: "Shoulder Mobility Flow", sets: 2, reps: "45s", restSec: 30 },
      ],
    },
  };

  const standardizedExerciseDatabase = Object.fromEntries(
    Object.entries(exerciseDatabase).map(([muscle, phases]) => [
      muscle,
      Object.fromEntries(
        Object.entries(phases).map(([phase, exercises]) => [
          phase,
          exercises.map((exercise) => ({
            ...exercise,
            sets: 4,
            reps: 15,
          })),
        ]),
      ),
    ]),
  );

  const resetMuscle = () => {
    setSelectedMuscle(null);
    setSelectedExercises({ main: null, secondary: null, accessory: null, finisher: null });
  };

  const handleSelectExercise = (type, exercise) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [type]: prev[type]?.name === exercise.name ? null : exercise,
    }));
  };

  const wrapperStyle = {
    background: "rgba(2,6,23,0.58)",
    border: "1px solid rgba(59,130,246,0.35)",
    borderRadius: "1rem",
  };

  const renderExerciseList = (title, subtitle, type, list, tone) => (
    <div
      className="p-4"
      style={{
        borderRadius: "0.75rem",
        border: `1px solid ${tone.border}`,
        background: tone.bg,
      }}
    >
      <h3 className="text-lg font-bold" style={{ color: tone.text }}>{title}</h3>
      <p className="text-xs mb-3" style={{ color: "#cbd5e1" }}>{subtitle}</p>
      <div className="space-y-2">
        {list.map((ex) => {
          const selected = selectedExercises[type]?.name === ex.name;
          return (
            <button
              key={ex.name}
              onClick={() => handleSelectExercise(type, ex)}
              className="w-full p-3 text-left"
              style={{
                borderRadius: 10,
                border: selected ? `1px solid ${tone.border}` : "1px solid rgba(148,163,184,0.28)",
                background: selected ? tone.active : "rgba(15,23,42,0.7)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{ex.name}</p>
                  <p className="text-xs" style={{ color: "#cbd5e1" }}>
                    {ex.sets}x{ex.reps} • {ex.restSec}s rest
                  </p>
                </div>
                {selected ? <Check className="w-4 h-4" style={{ color: tone.text }} /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (selectedMuscle) {
    const muscleData = standardizedExerciseDatabase[selectedMuscle];
    const currentMuscle = muscleGroups.find((m) => m.id === selectedMuscle);

    return (
      <div className="p-5 h-full flex flex-col" style={wrapperStyle}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Plan for {currentMuscle.label}</h2>
          <button
            onClick={resetMuscle}
            className="inline-flex items-center gap-2 px-3 py-2"
            style={{
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(30,41,59,0.68)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: "#cbd5e1" }}>
          Choose one exercise in each quadrant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {renderExerciseList("1. Main Exercise", "Choose 1 main exercise from 4 options.", "main", muscleData.main, {
            border: "rgba(16,185,129,0.4)",
            bg: "rgba(16,185,129,0.1)",
            active: "rgba(16,185,129,0.2)",
            text: "#6ee7b7",
          })}

          {renderExerciseList("2. Secondary Exercise", "Choose 1 secondary exercise from 4 options.", "secondary", muscleData.secondary, {
            border: "rgba(59,130,246,0.4)",
            bg: "rgba(59,130,246,0.1)",
            active: "rgba(59,130,246,0.2)",
            text: "#93c5fd",
          })}

          {renderExerciseList("3. Accessory Exercise", "Choose 1 accessory exercise from 4 options.", "accessory", muscleData.accessory, {
            border: "rgba(249,115,22,0.4)",
            bg: "rgba(249,115,22,0.1)",
            active: "rgba(249,115,22,0.2)",
            text: "#fdba74",
          })}

          {renderExerciseList("4. Finisher", "Choose 1 finisher from 4 options.", "finisher", muscleData.finisher, {
            border: "rgba(168,85,247,0.4)",
            bg: "rgba(168,85,247,0.1)",
            active: "rgba(168,85,247,0.2)",
            text: "#c4b5fd",
          })}
        </div>

        <div
          className="mt-4 p-3"
          style={{
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.28)",
            background: "rgba(15,23,42,0.65)",
          }}
        >
          <p className="text-sm font-semibold mb-1">Selection Summary</p>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>
            Main: {selectedExercises.main?.name || "Not selected"} | Secondary: {selectedExercises.secondary?.name || "Not selected"}
          </p>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>
            Accessory: {selectedExercises.accessory?.name || "Not selected"} | Finisher: {selectedExercises.finisher?.name || "Not selected"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 h-full flex flex-col" style={wrapperStyle}>
      <h2 className="text-2xl font-bold mb-1">Select Muscle Group</h2>
      <p className="text-sm mb-5" style={{ color: "#cbd5e1" }}>Choose the muscle group you want to train today.</p>

      <div className="space-y-2 mb-5">
        {muscleGroups.map((muscle) => (
          <button
            key={muscle.id}
            onClick={() => setSelectedMuscle(muscle.id)}
            className="w-full p-4 text-left"
            style={{
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.28)",
              background: "rgba(15,23,42,0.7)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{muscle.label}</p>
                <p className="text-sm" style={{ color: "#cbd5e1" }}>Open 4-quadrant exercise selection</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "#93c5fd" }} />
            </div>
          </button>
        ))}
      </div>

      <div
        className="mt-auto p-4"
        style={{
          borderRadius: 10,
          border: "1px solid rgba(59,130,246,0.35)",
          background: "rgba(59,130,246,0.12)",
        }}
      >
        <p className="font-semibold mb-1">How it works</p>
        <p className="text-sm" style={{ color: "#cbd5e1" }}>
          Select a muscle group, then choose one exercise in each quadrant: Main, Secondary, Accessory, and Finisher.
        </p>
      </div>
    </div>
  );
}
