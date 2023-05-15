import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { delModelById, putModelById } from '@/api/model';
import type { ModelSchema } from '@/types/mongoSchema';
import { Card, Box, Flex, Button, Tag, Grid } from '@chakra-ui/react';
import { useToast } from '@/hooks/useToast';
import { useForm } from 'react-hook-form';
import { formatModelStatus } from '@/constants/model';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user';
import { useLoading } from '@/hooks/useLoading';
import ModelEditForm from './components/ModelEditForm';
import ModelDataCard from './components/ModelDataCard';

const ModelDetail = ({ modelId, isPc }: { modelId: string; isPc: boolean }) => {
  const { toast } = useToast();
  const router = useRouter();
  const { userInfo, modelDetail, loadModelDetail, refreshModel, setLastModelId } = useUserStore();
  const { Loading, setIsLoading } = useLoading();
  const [btnLoading, setBtnLoading] = useState(false);

  const formHooks = useForm<ModelSchema>({
    defaultValues: modelDetail
  });

  // load model data
  const { isLoading } = useQuery([modelId], () => loadModelDetail(modelId), {
    onSuccess(res) {
      res && formHooks.reset(res);
      modelId && setLastModelId(modelId);
    },
    onError(err: any) {
      toast({
        title: err?.message || '获取AI助手异常',
        status: 'error'
      });
      setLastModelId('');
      refreshModel.freshMyModels();
      router.replace('/model');
    }
  });

  const isOwner = useMemo(
    () => modelDetail.userId === userInfo?._id,
    [modelDetail.userId, userInfo?._id]
  );

  const canRead = useMemo(
    () => isOwner || isLoading || modelDetail.share.isShareDetail,
    [isLoading, isOwner, modelDetail.share.isShareDetail]
  );

  /* 点击删除 */
  const handleDelModel = useCallback(async () => {
    if (!modelDetail) return;
    setIsLoading(true);
    try {
      await delModelById(modelDetail._id);
      toast({
        title: '删除成功',
        status: 'success'
      });
      refreshModel.removeModelDetail(modelDetail._id);
      router.replace('/model');
    } catch (err: any) {
      toast({
        title: err?.message || '删除失败',
        status: 'error'
      });
    }
    setIsLoading(false);
  }, [modelDetail, setIsLoading, toast, refreshModel, router]);

  /* 点前往聊天预览页 */
  const handlePreviewChat = useCallback(async () => {
    router.push(`/chat?modelId=${modelId}`);
  }, [router, modelId]);

  // 提交保存模型修改
  const saveSubmitSuccess = useCallback(
    async (data: ModelSchema) => {
      setBtnLoading(true);
      try {
        await putModelById(data._id, {
          name: data.name,
          avatar: data.avatar || '/icon/logo.png',
          chat: data.chat,
          share: data.share,
          security: data.security
        });
        toast({
          title: '更新成功',
          status: 'success'
        });
        refreshModel.updateModelDetail(data);
      } catch (err: any) {
        toast({
          title: err?.message || '更新失败',
          status: 'error'
        });
      }
      setBtnLoading(false);
    },
    [refreshModel, toast]
  );
  // 提交保存表单失败
  const saveSubmitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj) return '提交表单错误';
      if (!!obj.message) {
        return obj.message;
      }
      return deepSearch(Object.values(obj)[0]);
    };
    toast({
      title: deepSearch(formHooks.formState.errors),
      status: 'error',
      duration: 4000,
      isClosable: true
    });
  }, [formHooks.formState.errors, toast]);

  useEffect(() => {
    router.prefetch('/chat');

    window.onbeforeunload = (e) => {
      e.preventDefault();
      e.returnValue = '内容已修改，确认离开页面吗？';
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, [router]);

  return canRead ? (
    <Box h={'100%'} p={5} overflow={'overlay'} position={'relative'}>
      {/* 头部 */}
      <Card px={6} py={3}>
        {isPc ? (
          <Flex alignItems={'center'}>
            <Box fontSize={'xl'} fontWeight={'bold'}>
              {modelDetail.name}
            </Box>
            <Tag
              ml={2}
              variant="solid"
              colorScheme={formatModelStatus[modelDetail.status].colorTheme}
            >
              {formatModelStatus[modelDetail.status].text}
            </Tag>
            <Box flex={1} />
            <Button variant={'outline'} onClick={handlePreviewChat}>
              开始对话
            </Button>
            {isOwner && (
              <Button
                isLoading={btnLoading}
                ml={4}
                onClick={formHooks.handleSubmit(saveSubmitSuccess, saveSubmitError)}
              >
                保存修改
              </Button>
            )}
          </Flex>
        ) : (
          <>
            <Flex alignItems={'center'}>
              <Box as={'h3'} fontSize={'xl'} fontWeight={'bold'} flex={1}>
                {modelDetail.name}
              </Box>
              <Tag ml={2} colorScheme={formatModelStatus[modelDetail.status].colorTheme}>
                {formatModelStatus[modelDetail.status].text}
              </Tag>
            </Flex>
            <Box mt={4} textAlign={'right'}>
              <Button variant={'outline'} size={'sm'} onClick={handlePreviewChat}>
                开始对话
              </Button>
              {isOwner && (
                <Button
                  ml={4}
                  size={'sm'}
                  isLoading={btnLoading}
                  onClick={formHooks.handleSubmit(saveSubmitSuccess, saveSubmitError)}
                >
                  保存修改
                </Button>
              )}
            </Box>
          </>
        )}
      </Card>
      <Grid mt={5} gridTemplateColumns={['1fr', '1fr 1fr']} gridGap={5}>
        <ModelEditForm formHooks={formHooks} handleDelModel={handleDelModel} isOwner={isOwner} />

        <Card p={4} gridColumnStart={[1, 1]} gridColumnEnd={[2, 3]}>
          <ModelDataCard modelId={modelId} isOwner={isOwner} />
        </Card>
      </Grid>
      <Loading loading={isLoading} fixed={false} />
    </Box>
  ) : (
    <Box h={'100%'} p={5}>
      无权查看模型配置
    </Box>
  );
};

export default ModelDetail;
