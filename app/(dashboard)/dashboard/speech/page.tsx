"use client";

import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import { FeatureContainer } from "@/components/feature-container";
import { inputStyles, buttonStyles, contentStyles, loadingStyles } from "@/components/ui/feature-styles";
import { cn } from "@/lib/utils";

import { duration, formSchema } from "./constants";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

// Конфигурация для разных типов инструментов
const toolConfigs = {
  'speech-generation': {
    title: 'Speech Generation',
    description: `Turn your prompt into speech. Generation can take from 1 to 5 minutes\nPrice: ${MODEL_GENERATIONS_PRICE.speecGeneration} credits`,
    iconName: 'Mic',
    iconColor: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-600/10',
    placeholder: 'Text to be read aloud...'
  },
  'video-voiceover': {
    title: 'AI Voiceover',
    description: `Deliver broadcast-quality voiceovers for every video\nPrice: ${MODEL_GENERATIONS_PRICE.speecGeneration} credits`,
    iconName: 'Mic2',
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    placeholder: 'Welcome to my YouTube channel! Today we are exploring the fascinating world of AI...'
  },
  'voice-melody': {
    title: 'Melody Maker',
    description: `Generate vocal melodies and harmonies for your musical compositions\nPrice: ${MODEL_GENERATIONS_PRICE.speecGeneration} credits`,
    iconName: 'Mic',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    placeholder: 'Sing these lyrics with a gentle melody: "Beneath the stars, we find our way"'
  }
};

const SpeechPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolId = searchParams.get('toolId') || 'speech-generation';
  const [speechList, setSpeechList] = useState<string[]>([]);

  // Получаем конфигурацию для текущего инструмента
  const currentTool = toolConfigs[toolId as keyof typeof toolConfigs] || toolConfigs['speech-generation'];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      duration: "5",
    }
  });

  // Обновляем placeholder при изменении toolId
  useEffect(() => {
    form.reset({ prompt: "", duration: "5" });
  }, [toolId, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post('/api/speech', values);
      setSpeechList((prev) => [...prev, response.data]);
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }

    return (
    <div className="bg-white">
      <FeatureContainer
      title={currentTool.title}
      description={currentTool.description}
      iconName={currentTool.iconName as keyof typeof import("lucide-react")}

    >
      <div className={contentStyles.base}>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className={cn(
              inputStyles.container,
              "grid grid-cols-12 gap-2"
            )}
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-7">
                  <FormControl className="m-0 p-0">
                    <Input
                      className={inputStyles.base}
                      disabled={isLoading} 
                      placeholder={currentTool.placeholder}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-3">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {duration.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              className={cn(
                buttonStyles.base,
                "col-span-12 lg:col-span-2 w-full"
              )}
              type="submit"
              disabled={isLoading}
              size="icon"
            >
              Generate
            </Button>
          </form>
        </Form>
        <div className={contentStyles.section}>
          {isLoading && (
            <div className={loadingStyles.container}>
              <Loader />
            </div>
          )}
          {speechList.length === 0 && !isLoading && (
            <Empty label="No results yet" />
          )}
          <div className="space-y-4">
            {speechList.map((speech, index) => (
              <audio key={index} controls className="w-full">
                <source src={speech} />
              </audio>
            ))}
          </div>
        </div>
      </div>
    </FeatureContainer>
    </div>
  );
}
 
export default SpeechPage;
