import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/utils/axios";
import JobPostingForm from "@/components/forms/JobPostingForm";

export default function PostInternshipPage() {
  const navigate = useNavigate();

  const { mutate: createJob, isPending } = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await api.post("/jobs", data);
      return response;
    },
    onSuccess: () => {
      toast.success("Internship posted successfully");
      navigate("/employer/dashboard");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error posting internship"
      );
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post Internship</h1>
        <p className="text-muted-foreground">
          Create a new internship opportunity
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <JobPostingForm type="internship" onSubmit={createJob} />
      </div>
    </div>
  );
}
